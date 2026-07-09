<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoinReport;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\PlanPurchaseHistory;
use App\Models\Setting;
use App\Models\User;
use App\Models\WalletReport;
use Illuminate\Http\Request;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'uid'     => 'required|integer',
            'type'    => 'required|in:package,plan,wallet',
            'item_id' => 'required_if:type,package,plan|nullable|integer',
            'amount'  => 'required_if:type,wallet|nullable|numeric|min:0.01',
        ]);

        $user = User::find($request->uid);
        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $metadata = ['uid' => (string) $user->id, 'type' => $request->type];

        if ($request->type === 'package') {
            $item = Package::find($request->item_id);
            if (! $item) {
                return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Invalid item']);
            }
            $label = "{$item->coin} coins";
            $amount = $item->amt;
            $metadata['item_id'] = (string) $item->id;
        } elseif ($request->type === 'plan') {
            $item = Plan::find($request->item_id);
            if (! $item) {
                return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Invalid item']);
            }
            $label = $item->title;
            $amount = $item->amt;
            $metadata['item_id'] = (string) $item->id;
        } else {
            $label = 'Wallet top-up';
            $amount = (float) $request->amount;
            $metadata['amount'] = (string) $amount;
        }

        if (! config('services.stripe.secret')) {
            report(new \RuntimeException('Stripe checkout attempted with no STRIPE_SECRET configured'));
            return response()->json(['ResponseCode' => '500', 'Result' => 'false', 'ResponseMsg' => 'Stripe is not configured on the server yet']);
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = CheckoutSession::create([
                'mode'                 => 'payment',
                'payment_method_types' => ['card'],
                'customer_email'       => $user->email,
                'line_items'           => [[
                    'quantity'   => 1,
                    'price_data' => [
                        'currency'     => env('STRIPE_CURRENCY', 'eur'),
                        'unit_amount'  => (int) round($amount * 100),
                        'product_data' => ['name' => $label],
                    ],
                ]],
                'metadata'    => $metadata,
                'success_url' => rtrim(config('app.url'), '/').'/stripe/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => rtrim(config('app.url'), '/').'/stripe/cancel',
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            report($e);
            return response()->json(['ResponseCode' => '500', 'Result' => 'false', 'ResponseMsg' => 'Stripe error: '.$e->getMessage()]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Checkout session created',
            'checkout_url' => $session->url,
        ]);
    }

    public function webhook(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException|\UnexpectedValueException $e) {
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $this->fulfill($event->data->object);
        }

        return response('', 200);
    }

    private function fulfill(CheckoutSession $session): void
    {
        $uid    = $session->metadata->uid ?? null;
        $type   = $session->metadata->type ?? null;
        $itemId = $session->metadata->item_id ?? null;

        if (! $uid || ! $type) {
            return;
        }

        $user = User::find($uid);
        if (! $user) {
            return;
        }

        if ($type === 'wallet') {
            if (WalletReport::where('stripe_session_id', $session->id)->exists()) {
                return;
            }

            $amt     = (float) ($session->metadata->amount ?? 0);
            $setting = Setting::current();
            $coins   = $amt / max($setting->coin_amt ?? 0.01, 0.01);

            $user->increment('wallet', $amt);
            $user->increment('coin', $coins);

            WalletReport::create([
                'uid'               => $user->id,
                'message'           => 'Wallet top-up (Stripe)',
                'status'            => 'Credit',
                'amt'               => $amt,
                'tdate'             => now()->toDateString(),
                'stripe_session_id' => $session->id,
            ]);
        } elseif ($type === 'package') {
            if (CoinReport::where('stripe_session_id', $session->id)->exists()) {
                return;
            }

            $package = Package::find($itemId);
            if (! $package) {
                return;
            }

            $user->increment('coin', $package->coin);

            CoinReport::create([
                'uid'               => $user->id,
                'message'           => "Purchased {$package->coin} coins (Stripe)",
                'status'            => 'Credit',
                'amt'               => $package->coin,
                'tdate'             => now()->toDateString(),
                'stripe_session_id' => $session->id,
            ]);
        } elseif ($type === 'plan') {
            if (PlanPurchaseHistory::where('stripe_session_id', $session->id)->exists()) {
                return;
            }

            $plan = Plan::find($itemId);
            if (! $plan) {
                return;
            }

            $startDate  = now()->toDateString();
            $expireDate = now()->addDays($plan->day_limit)->toDateString();

            PlanPurchaseHistory::create([
                'uid'               => $user->id,
                'plan_id'           => $plan->id,
                'p_name'            => $user->name,
                't_date'            => now(),
                'amount'            => $plan->amt,
                'day'               => $plan->day_limit,
                'plan_title'        => $plan->title,
                'plan_description'  => $plan->description,
                'expire_date'       => $expireDate,
                'start_date'        => $startDate,
                'trans_id'          => $session->id,
                'p_method_id'       => PaymentMethod::where('title', 'Stripe')->value('id') ?? 0,
                'stripe_session_id' => $session->id,
            ]);

            $user->update([
                'plan_id'         => $plan->id,
                'plan_start_date' => $startDate,
                'plan_end_date'   => $expireDate,
                'is_subscribe'    => 1,
                'history_id'      => PlanPurchaseHistory::where('uid', $user->id)->max('id'),
                'direct_chat'     => $plan->direct_chat,
                'direct_audio'    => $plan->audio_video,
                'direct_video'    => $plan->audio_video,
            ]);
        }
    }
}

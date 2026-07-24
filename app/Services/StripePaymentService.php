<?php

namespace App\Services;

use App\Models\CoinReport;
use App\Models\Package;
use App\Models\Plan;
use App\Models\PlanPurchaseHistory;
use App\Models\Setting;
use App\Models\User;
use App\Models\WalletReport;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

/**
 * All Stripe payment verification + crediting logic lives here, isolated from
 * any Request/Response. The synchronous confirm controller calls creditUser()
 * today; a future webhook can call the exact same method with zero duplication.
 */
class StripePaymentService
{
    private const CURRENCY_MAP = [
        '€' => 'eur',
        '$' => 'usd',
        '£' => 'gbp',
    ];

    private function client(): StripeClient
    {
        return new StripeClient(Setting::current()->stripe_secret);
    }

    private function currencyCode(): string
    {
        $symbol = Setting::current()->currency;

        return self::CURRENCY_MAP[$symbol] ?? 'eur';
    }

    /**
     * @return array{client_secret: string, publishable_key: string}
     */
    public function createIntent(User $user, string $type, int $referenceId, ?float $rawAmount = null): array
    {
        $amount = $type === 'wallet' ? $rawAmount : $this->resolveAmount($type, $referenceId);
        $currency = $this->currencyCode();

        $intent = $this->client()->paymentIntents->create([
            'amount'   => (int) round($amount * 100),
            'currency' => $currency,
            'metadata' => [
                'user_id'      => (string) $user->id,
                'type'         => $type,
                'reference_id' => (string) $referenceId,
            ],
            'automatic_payment_methods' => ['enabled' => true, 'allow_redirects' => 'never'],
        ]);

        return [
            'client_secret'   => $intent->client_secret,
            'publishable_key' => Setting::current()->stripe_key,
        ];
    }

    public function creditUser(string $paymentIntentId): bool
    {
        $intent = $this->client()->paymentIntents->retrieve($paymentIntentId);

        if ($intent->status !== 'succeeded') {
            return false;
        }

        $userId = (int) $intent->metadata['user_id'];
        $type = $intent->metadata['type'];
        $referenceId = (int) $intent->metadata['reference_id'];
        $amount = $intent->amount / 100;
        $currency = $intent->currency;

        try {
            DB::table('transactions')->insert([
                'payment_intent_id' => $paymentIntentId,
                'user_id'           => $userId,
                'type'              => $type,
                'reference_id'      => $referenceId,
                'amount'            => $amount,
                'currency'          => $currency,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        } catch (QueryException $e) {
            if ((int) $e->getCode() === 23000) {
                return true; // already processed (payment_intent_id unique constraint), idempotent no-op
            }
            throw $e;
        }

        $user = User::find($userId);
        if (! $user) {
            return false;
        }

        if ($type === 'plan') {
            $this->creditPlan($user, Plan::find($referenceId), $amount, $paymentIntentId);
        } elseif ($type === 'wallet') {
            $this->creditWallet($user, $amount);
        } else {
            $this->creditPackage($user, Package::find($referenceId));
        }

        return true;
    }

    private function resolveAmount(string $type, int $referenceId): float
    {
        if ($type === 'plan') {
            $plan = Plan::findOrFail($referenceId);

            return (float) $plan->amt;
        }

        $package = Package::findOrFail($referenceId);

        return (float) $package->amt;
    }

    private function creditPlan(User $user, ?Plan $plan, float $amount, string $paymentIntentId): void
    {
        if (! $plan) {
            return;
        }

        $startDate = now()->toDateString();
        $expireDate = now()->addDays($plan->day_limit)->toDateString();

        PlanPurchaseHistory::create([
            'uid'              => $user->id,
            'plan_id'          => $plan->id,
            'p_name'           => $user->name,
            't_date'           => now(),
            'amount'           => $amount,
            'day'              => $plan->day_limit,
            'plan_title'       => $plan->title,
            'plan_description' => $plan->description,
            'expire_date'      => $expireDate,
            'start_date'       => $startDate,
            'trans_id'         => $paymentIntentId,
            'p_method_id'      => 2,
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

    private function creditWallet(User $user, float $amount): void
    {
        $setting = Setting::current();
        $coins = $amount / max($setting->coin_amt ?? 0.01, 0.01);

        $user->increment('wallet', $amount);
        $user->increment('coin', $coins);

        WalletReport::create([
            'uid'     => $user->id,
            'message' => 'Wallet top-up',
            'status'  => 'Credit',
            'amt'     => $amount,
            'tdate'   => now()->toDateString(),
        ]);
    }

    private function creditPackage(User $user, ?Package $package): void
    {
        if (! $package) {
            return;
        }

        $user->increment('coin', $package->coin);

        CoinReport::create([
            'uid'     => $user->id,
            'message' => "Purchased {$package->coin} coins",
            'status'  => 'Credit',
            'amt'     => $package->coin,
            'tdate'   => now()->toDateString(),
        ]);
    }
}

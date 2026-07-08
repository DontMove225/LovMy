<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\PlanPurchaseHistory;
use App\Models\User;
use App\Models\Setting;
use App\Models\CoinReport;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function plans(Request $request)
    {
        $plans = Plan::where('status', 1)->get()->map(fn ($p) => [
            'id'             => (string) $p->id,
            'title'          => $p->title,
            'amt'            => (string) $p->amt,
            'description'    => $p->description,
            'filter_include' => $p->filter_include ? '1' : '0',
            'day_limit'      => (string) $p->day_limit,
            'direct_chat'    => $p->direct_chat ? '1' : '0',
            'audio_video'    => $p->audio_video ? '1' : '0',
            'status'         => (string) $p->status,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Plans',
            'PlanData'     => $plans,
        ]);
    }

    public function paymentGateway(Request $request)
    {
        $gateways = PaymentMethod::where('status', 1)->where('p_show', 1)->get()->map(fn ($g) => [
            'id'         => (string) $g->id,
            'title'      => $g->title,
            'img'        => $g->img,
            'attributes' => $g->attributes,
            'status'     => (string) $g->status,
            'subtitle'   => $g->subtitle,
            'p_show'     => (string) $g->p_show,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Payment gateways',
            'paymentdata'  => $gateways,
        ]);
    }

    public function purchasePlan(Request $request)
    {
        $request->validate([
            'uid'        => 'required|integer',
            'plan_id'    => 'required|integer',
            'trans_id'   => 'required|string',
            'p_method_id'=> 'required|integer',
            'amount'     => 'required|numeric',
        ]);

        $user = User::find($request->uid);
        $plan = Plan::find($request->plan_id);

        if (! $user || ! $plan) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid user or plan',
            ]);
        }

        $startDate  = now()->toDateString();
        $expireDate = now()->addDays($plan->day_limit)->toDateString();

        PlanPurchaseHistory::create([
            'uid'              => $user->id,
            'plan_id'          => $plan->id,
            'p_name'           => $user->name,
            't_date'           => now(),
            'amount'           => $request->amount,
            'day'              => $plan->day_limit,
            'plan_title'       => $plan->title,
            'plan_description' => $plan->description,
            'expire_date'      => $expireDate,
            'start_date'       => $startDate,
            'trans_id'         => $request->trans_id,
            'p_method_id'      => $request->p_method_id,
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

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Plan purchased successfully!',
            'UserData'     => $user->fresh(),
        ]);
    }

    public function packages(Request $request)
    {
        $packages = Package::where('status', 1)->get()->map(fn ($p) => [
            'id'   => (string) $p->id,
            'coin' => (string) $p->coin,
            'amt'  => (string) $p->amt,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Coin packages',
            'packlist'     => $packages,
        ]);
    }

    public function purchasePackage(Request $request)
    {
        $request->validate([
            'uid'         => 'required|integer',
            'package_id'  => 'required|integer',
            'trans_id'    => 'required|string',
        ]);

        $user    = User::find($request->uid);
        $package = Package::find($request->package_id);

        if (! $user || ! $package) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid user or package',
            ]);
        }

        $user->increment('coin', $package->coin);

        CoinReport::create([
            'uid'     => $user->id,
            'message' => "Purchased {$package->coin} coins",
            'status'  => 'Credit',
            'amt'     => $package->coin,
            'tdate'   => now()->toDateString(),
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => "Successfully purchased {$package->coin} coins!",
            'UserData'     => $user->fresh(),
        ]);
    }

    public function coinReport(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $user    = User::find($request->uid);
        $setting = Setting::current();

        $report = CoinReport::where('uid', $request->uid)
            ->orderByDesc('id')
            ->paginate(20);

        $items = collect($report->items())->map(fn ($item) => [
            'message' => $item->message,
            'status'  => $item->status,
            'amt'     => (string) $item->amt,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Coin report',
            'Coinitem'     => $items,
            'coin'         => (string) ($user->coin ?? 0),
            'coin_amt'     => (string) ($setting->coin_amt ?? 0),
            'coin_limit'   => (string) ($setting->coin_limit ?? 0),
            'total'        => $report->total(),
        ]);
    }
}

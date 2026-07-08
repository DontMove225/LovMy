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
        $plans = Plan::where('status', 1)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Plans',
            'data'         => $plans,
        ]);
    }

    public function paymentGateway(Request $request)
    {
        $gateways = PaymentMethod::where('status', 1)->where('p_show', 1)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Payment gateways',
            'data'         => $gateways,
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
        $packages = Package::where('status', 1)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Coin packages',
            'data'         => $packages,
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

        $report = CoinReport::where('uid', $request->uid)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Coin report',
            'data'         => $report->items(),
            'total'        => $report->total(),
        ]);
    }

    public function planHistory(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $history = PlanPurchaseHistory::where('uid', $request->uid)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Plan purchase history',
            'data'         => $history->items(),
            'total'        => $history->total(),
        ]);
    }
}

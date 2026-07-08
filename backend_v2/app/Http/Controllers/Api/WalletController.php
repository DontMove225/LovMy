<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PayoutSetting;
use App\Models\Setting;
use App\Models\User;
use App\Models\WalletReport;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function walletUp(Request $request)
    {
        $request->validate([
            'uid'      => 'required|integer',
            'amt'      => 'required|numeric|min:0.01',
            'trans_id' => 'required|string',
        ]);

        $user    = User::find($request->uid);
        $setting = Setting::current();

        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $coins = $request->amt / max($setting->coin_amt ?? 0.01, 0.01);

        $user->increment('wallet', $request->amt);
        $user->increment('coin', $coins);

        WalletReport::create([
            'uid'     => $user->id,
            'message' => 'Wallet top-up',
            'status'  => 'Credit',
            'amt'     => $request->amt,
            'tdate'   => now()->toDateString(),
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Wallet updated successfully!',
            'UserData'     => $user->fresh(),
        ]);
    }

    public function walletReport(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $user = User::find($request->uid);

        $report = WalletReport::where('uid', $request->uid)
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
            'ResponseMsg'  => 'Wallet report',
            'Walletitem'   => $items,
            'wallet'       => (string) ($user->wallet ?? 0),
            'total'        => $report->total(),
        ]);
    }

    public function requestWithdraw(Request $request)
    {
        $request->validate([
            'uid'         => 'required|integer',
            'amt'         => 'required|numeric|min:1',
            'coin'        => 'required|numeric',
            'r_type'      => 'required|in:UPI,BANK Transfer,Paypal',
            'acc_number'  => 'nullable|string',
            'bank_name'   => 'nullable|string',
            'acc_name'    => 'nullable|string',
            'ifsc_code'   => 'nullable|string',
            'upi_id'      => 'nullable|string',
            'paypal_id'   => 'nullable|string',
        ]);

        $user = User::find($request->uid);

        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $setting  = Setting::current();
        $minLimit = $setting->coin_limit ?? 0;

        if ($request->coin < $minLimit) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => "Minimum withdrawal is {$minLimit} coins",
            ]);
        }

        if ($user->coin < $request->coin) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Insufficient coins',
            ]);
        }

        PayoutSetting::create([
            'uid'        => $user->id,
            'amt'        => $request->amt,
            'coin'       => $request->coin,
            'status'     => 'Pending',
            'r_date'     => now(),
            'r_type'     => $request->r_type,
            'acc_number' => $request->acc_number,
            'bank_name'  => $request->bank_name,
            'acc_name'   => $request->acc_name,
            'ifsc_code'  => $request->ifsc_code,
            'upi_id'     => $request->upi_id,
            'paypal_id'  => $request->paypal_id,
        ]);

        $user->decrement('coin', $request->coin);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Withdrawal request submitted!',
        ]);
    }

    public function payoutList(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $payouts = PayoutSetting::where('uid', $request->uid)
            ->orderByDesc('id')
            ->paginate(20);

        $items = collect($payouts->items())->map(fn ($p) => [
            'payout_id'  => (string) $p->id,
            'amt'        => (string) $p->amt,
            'coin'       => (string) $p->coin,
            'status'     => $p->status,
            'proof'      => $p->proof,
            'r_date'     => optional($p->r_date)->toIso8601String(),
            'r_type'     => $p->r_type,
            'acc_number' => $p->acc_number ?? '',
            'bank_name'  => $p->bank_name ?? '',
            'acc_name'   => $p->acc_name ?? '',
            'ifsc_code'  => $p->ifsc_code ?? '',
            'upi_id'     => $p->upi_id ?? '',
            'paypal_id'  => $p->paypal_id ?? '',
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Payout list',
            'Payoutlist'   => $items,
            'total'        => $payouts->total(),
        ]);
    }
}

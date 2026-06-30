<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoinReport;
use App\Models\PayoutSetting;
use App\Models\PlanPurchaseHistory;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => [
                'total_users'       => User::where('status', 1)->where('user_type', 'REAL_USER')->count(),
                'total_fake_users'  => User::where('user_type', 'FAKE_USER')->count(),
                'total_subscribers' => User::where('is_subscribe', 1)->count(),
                'total_revenue'     => PlanPurchaseHistory::sum('amount'),
                'pending_payouts'   => PayoutSetting::where('status', 'Pending')->count(),
                'pending_reports'   => Report::count(),
                'new_users_today'   => User::whereDate('rdate', today())->count(),
            ],
        ]);
    }

    public function settings()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => Setting::current(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $setting = Setting::current();
        $setting->fill($request->only([
            'webname', 'weblogo', 'timezone', 'currency', 'one_key', 'one_hash',
            'show_dark', 'sms_type', 'auth_key', 'otp_id', 'acc_id', 'auth_token',
            'twilio_number', 'admob', 'slogin', 'mode', 'banner_id', 'in_id', 'fmode',
            'map_key', 'coin_amt', 'otp_auth', 'coin_limit', 'coin_fun', 'agora_app_id',
            'scredit', 'rcredit', 'ios_banner_id', 'ios_in_id',
        ]));
        $setting->save();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Settings updated!',
        ]);
    }

    public function userList(Request $request)
    {
        $users = User::where('user_type', 'REAL_USER')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $users->items(),
            'total'        => $users->total(),
        ]);
    }

    public function banUser(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'status' => 'required|in:0,1']);
        User::where('id', $request->uid)->update(['status' => $request->status]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => $request->status == 1 ? 'User activated' : 'User banned',
        ]);
    }

    public function verifyUser(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'is_verify' => 'required|in:0,1']);
        User::where('id', $request->uid)->update(['is_verify' => $request->is_verify]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Verification status updated',
        ]);
    }

    public function reportList()
    {
        $reports = Report::with(['reporter:id,name', 'reported:id,name,profile_pic'])
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $reports->items(),
            'total'        => $reports->total(),
        ]);
    }

    public function payoutList(Request $request)
    {
        $payouts = PayoutSetting::with('user:id,name,email,mobile')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $payouts->items(),
            'total'        => $payouts->total(),
        ]);
    }

    public function approvePayout(Request $request)
    {
        $request->validate(['id' => 'required|integer', 'status' => 'required|in:Approved,Rejected']);

        $payout = PayoutSetting::find($request->id);
        if (! $payout) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Payout not found']);
        }

        $payout->update(['status' => $request->status]);

        if ($request->status === 'Rejected') {
            $user = User::find($payout->uid);
            if ($user) {
                $user->increment('coin', $payout->coin);
            }
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => "Payout {$request->status}",
        ]);
    }

    public function paymentList()
    {
        $payments = PlanPurchaseHistory::with('user:id,name')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $payments->items(),
            'total'        => $payments->total(),
        ]);
    }

    public function sendNotification(Request $request)
    {
        $request->validate([
            'title'       => 'required|string',
            'description' => 'required|string',
            'uid'         => 'nullable|integer',
        ]);

        if ($request->uid) {
            \App\Models\Notification::create([
                'uid'         => $request->uid,
                'datetime'    => now(),
                'title'       => $request->title,
                'description' => $request->description,
            ]);
        } else {
            User::where('status', 1)->chunk(100, function ($users) use ($request) {
                foreach ($users as $user) {
                    \App\Models\Notification::create([
                        'uid'         => $user->id,
                        'datetime'    => now(),
                        'title'       => $request->title,
                        'description' => $request->description,
                    ]);
                }
            });
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Notification sent!',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendPushNotificationJob;
use App\Models\Admin;
use App\Models\CoinReport;
use App\Models\Faq;
use App\Models\Gift;
use App\Models\Interest;
use App\Models\Language;
use App\Models\Package;
use App\Models\Page;
use App\Models\Plan;
use App\Models\PayoutSetting;
use App\Models\PlanPurchaseHistory;
use App\Models\RelationGoal;
use App\Models\Religion;
use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => Cache::remember('admin_dashboard_stats', 60, function () {
                return [
                    'total_users'       => User::where('user_type', 'REAL_USER')->count(),
                    'total_male'        => User::where('user_type', 'REAL_USER')->where('gender', 'Male')->count(),
                    'total_female'      => User::where('user_type', 'REAL_USER')->where('gender', 'Female')->count(),
                    'total_fake_users'  => User::where('user_type', 'FAKE_USER')->count(),
                    'total_subscribers' => User::where('is_subscribe', 1)->count(),
                    'new_users_today'   => User::whereDate('rdate', today())->count(),
                    'total_revenue'     => PlanPurchaseHistory::sum('amount'),
                    'pending_payouts'   => PayoutSetting::where('status', 'Pending')->count(),
                    'pending_reports'   => Report::count(),
                    'total_interests'   => Interest::count(),
                    'total_languages'   => Language::count(),
                    'total_religions'   => Religion::count(),
                    'total_goals'       => RelationGoal::count(),
                    'total_faqs'        => Faq::count(),
                    'total_plans'       => Plan::count(),
                    'total_packages'    => Package::count(),
                    'total_gifts'       => Gift::count(),
                    'total_pages'       => Page::count(),
                ];
            }),
        ]);
    }

    public function staffList()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => Admin::select('id', 'name', 'username', 'email')->get(),
        ]);
    }

    public function staffStore(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'username' => 'required|string|unique:tbl_admin,username',
            'email'    => 'required|email|unique:tbl_admin,email',
            'password' => 'required|string|min:6',
        ]);

        Admin::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['ResponseCode' => '200', 'Result' => 'true', 'ResponseMsg' => 'Staff member added']);
    }

    public function staffDestroy(int $id)
    {
        Admin::findOrFail($id)->delete();
        return response()->json(['ResponseCode' => '200', 'Result' => 'true', 'ResponseMsg' => 'Staff member removed']);
    }

    public function generateFakeUser(Request $request)
    {
        $request->validate([
            'name'   => 'required|string',
            'mobile' => 'required|string|unique:tbl_users,mobile',
            'gender' => 'required|in:Male,Female',
        ]);

        User::create([
            'name'      => $request->name,
            'mobile'    => $request->mobile,
            'email'     => $request->mobile . '@fake.lovmy.fr',
            'gender'    => $request->gender,
            'password'  => Hash::make('fake_' . $request->mobile),
            'user_type' => 'FAKE_USER',
            'status'    => 1,
            'ccode'     => $request->ccode ?? '+33',
            'rdate'     => now()->toDateString(),
        ]);

        return response()->json(['ResponseCode' => '200', 'Result' => 'true', 'ResponseMsg' => 'Fake user created']);
    }

    public function settings()
    {
        $setting = Setting::current();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => \Illuminate\Support\Arr::only($setting->toArray(), Setting::COMMUNICATION_FIELDS),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $setting = Setting::current();

        $data = $request->only(Setting::COMMUNICATION_FIELDS);

        // Laravel's ConvertEmptyStringsToNull middleware turns "" into null; several of
        // these columns are NOT NULL, so silently drop untouched (null) fields instead
        // of letting them wipe out existing values or fail the update.
        $setting->fill(array_filter($data, fn ($value) => $value !== null));
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

            $fcmToken = User::whereKey($request->uid)->value('fcm_token');
            if ($fcmToken) {
                SendPushNotificationJob::dispatch([$fcmToken], $request->title, $request->description);
            }
        } else {
            User::where('status', 1)->chunk(100, function ($users) use ($request) {
                $tokens = [];

                foreach ($users as $user) {
                    \App\Models\Notification::create([
                        'uid'         => $user->id,
                        'datetime'    => now(),
                        'title'       => $request->title,
                        'description' => $request->description,
                    ]);

                    if ($user->fcm_token) {
                        $tokens[] = $user->fcm_token;
                    }
                }

                if ($tokens) {
                    SendPushNotificationJob::dispatch($tokens, $request->title, $request->description);
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

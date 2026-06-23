<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function homeData(Request $request)
    {
        $request->validate([
            'uid'   => 'required|integer',
            'lats'  => 'nullable|numeric',
            'longs' => 'nullable|numeric',
        ]);

        $user = User::find($request->uid);

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'User not found',
            ]);
        }

        // Update location
        if ($request->lats && $request->longs) {
            $user->update(['lats' => $request->lats, 'longs' => $request->longs]);
        }

        $setting = Setting::current();

        // Determine search preference
        $searchGender = $user->search_preference ?? 'FEMALE';

        // Get already-acted-on profiles
        $actedIds = \App\Models\Action::where('uid', $user->id)
            ->pluck('profile_id')
            ->toArray();

        $actedIds[] = $user->id;

        $radius = (float) ($user->radius_search ?? 50);

        // Build profiles query
        $query = User::where('status', 1)
            ->where('user_type', 'REAL_USER')
            ->whereNotIn('id', $actedIds);

        if ($searchGender !== 'ALL') {
            $query->where('gender', $searchGender);
        }

        // Filter by subscription features
        if ($user->isSubscribed()) {
            $plan = $user->plan;
            if ($plan && $plan->filter_include) {
                if ($request->min_age && $request->max_age) {
                    $query->whereBetween('birth_date', [
                        now()->subYears($request->max_age)->toDateString(),
                        now()->subYears($request->min_age)->toDateString(),
                    ]);
                }
            }
        }

        $profiles = $query->select([
            'id', 'name', 'profile_pic', 'birth_date', 'gender',
            'lats', 'longs', 'profile_bio', 'other_pic', 'is_verify',
            'relation_goal', 'interest', 'language', 'religion', 'height',
        ])->limit(50)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Home Data',
            'data'         => $profiles,
            'setting'      => [
                'coin_amt'    => $setting->coin_amt ?? 0,
                'coin_fun'    => $setting->coin_fun ?? 'Enabled',
                'agora_app_id' => $setting->agora_app_id ?? '',
            ],
        ]);
    }

    public function filter(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $user = User::find($request->uid);
        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $actedIds   = \App\Models\Action::where('uid', $user->id)->pluck('profile_id')->toArray();
        $actedIds[] = $user->id;

        $query = User::where('status', 1)
            ->where('user_type', 'REAL_USER')
            ->whereNotIn('id', $actedIds);

        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

        if ($request->min_age && $request->max_age) {
            $query->whereBetween('birth_date', [
                now()->subYears($request->max_age)->toDateString(),
                now()->subYears($request->min_age)->toDateString(),
            ]);
        }

        $profiles = $query->select([
            'id', 'name', 'profile_pic', 'birth_date', 'gender',
            'lats', 'longs', 'profile_bio', 'other_pic', 'is_verify',
            'relation_goal', 'interest', 'language', 'religion', 'height',
        ])->limit(50)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Filter Result',
            'data'         => $profiles,
        ]);
    }

    public function mapInfo(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'lats' => 'required', 'longs' => 'required']);

        $user = User::find($request->uid);
        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $actedIds   = \App\Models\Action::where('uid', $user->id)->pluck('profile_id')->toArray();
        $actedIds[] = $user->id;

        $profiles = User::where('status', 1)
            ->where('user_type', 'REAL_USER')
            ->whereNotIn('id', $actedIds)
            ->whereNotNull('lats')
            ->whereNotNull('longs')
            ->where('lats', '!=', '')
            ->select(['id', 'name', 'profile_pic', 'lats', 'longs', 'gender'])
            ->limit(100)
            ->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Map Data',
            'data'         => $profiles,
        ]);
    }
}

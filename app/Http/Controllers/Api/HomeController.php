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

        if ($request->relation_goal) {
            $query->where('relation_goal', $request->relation_goal);
        }

        if ($request->religion) {
            $query->where('religion', $request->religion);
        }

        if ($request->boolean('verified_only')) {
            $query->where('is_verify', 1);
        }

        if ($request->boolean('premium_only')) {
            $query->where('is_subscribe', 1);
        }

        if ($request->interest) {
            $query->where('interest', 'like', '%' . $request->interest . '%');
        }

        if ($request->language) {
            $query->where('language', 'like', '%' . $request->language . '%');
        }

        $query->select([
            'id', 'name', 'profile_pic', 'birth_date', 'gender',
            'lats', 'longs', 'profile_bio', 'other_pic', 'is_verify',
            'is_subscribe', 'relation_goal', 'interest', 'language', 'religion', 'height',
        ]);

        $usedFallback = false;

        if ($request->max_distance && $user->lats && $user->longs) {
            // Haversine distance computed in SQL so MySQL only returns rows within
            // range, instead of loading the whole candidate set into PHP to filter.
            $query->whereNotNull('lats')->whereNotNull('longs')->where('lats', '!=', '')
                ->selectRaw(
                    '(6371 * acos(least(1, greatest(-1,
                        cos(radians(?)) * cos(radians(lats)) * cos(radians(longs) - radians(?))
                        + sin(radians(?)) * sin(radians(lats))
                    )))) as distance_km',
                    [(float) $user->lats, (float) $user->longs, (float) $user->lats]
                )
                ->orderBy('distance_km');

            $profiles = (clone $query)->having('distance_km', '<=', (float) $request->max_distance)->limit(50)->get();

            if ($profiles->isEmpty()) {
                // Nobody within the requested radius: fall back to the closest
                // profiles regardless of distance, rather than showing nothing.
                $usedFallback = true;
                $profiles = $query->limit(50)->get();
            }
        } else {
            $profiles = $query->limit(50)->get();
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Filter Result',
            'data'         => $profiles,
            'fallback'     => $usedFallback,
        ]);
    }

    public function mapInfo(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'lats' => 'required|numeric', 'longs' => 'required|numeric']);

        $user = User::find($request->uid);
        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }

        $user->update(['lats' => $request->lats, 'longs' => $request->longs]);

        $actedIds   = \App\Models\Action::where('uid', $user->id)->pluck('profile_id')->toArray();
        $actedIds[] = $user->id;

        $radius = (float) ($user->radius_search ?: 50);

        $query = User::where('status', 1)
            ->where('user_type', 'REAL_USER')
            ->whereNotIn('id', $actedIds)
            ->whereNotNull('lats')
            ->whereNotNull('longs')
            ->where('lats', '!=', '')
            ->select(['id', 'name', 'profile_pic', 'birth_date', 'gender', 'lats', 'longs', 'profile_bio', 'is_verify'])
            ->selectRaw(
                '(6371 * acos(least(1, greatest(-1,
                    cos(radians(?)) * cos(radians(lats)) * cos(radians(longs) - radians(?))
                    + sin(radians(?)) * sin(radians(lats))
                )))) as distance_km',
                [(float) $request->lats, (float) $request->longs, (float) $request->lats]
            )
            ->orderBy('distance_km');

        $usedFallback = false;
        $profiles = (clone $query)->having('distance_km', '<=', $radius)->limit(100)->get();

        if ($profiles->isEmpty()) {
            // Nobody within the user's configured radius: show the closest
            // profiles anyway rather than an empty map.
            $usedFallback = true;
            $profiles = $query->limit(20)->get();
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Map Data',
            'data'         => $profiles,
            'fallback'     => $usedFallback,
        ]);
    }
}

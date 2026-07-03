<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
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

        // Enrichir chaque profil avec les champs attendus par Flutter
        $userLat  = (float) ($user->lats  ?: 0);
        $userLng  = (float) ($user->longs ?: 0);

        $profilelist = $profiles->map(function ($p) use ($userLat, $userLng) {
            // Age calculé depuis birth_date
            $age = $p->birth_date ? \Carbon\Carbon::parse($p->birth_date)->age : null;

            // Distance Haversine (km)
            $pLat = (float) $p->lats;
            $pLng = (float) $p->longs;
            $distance = null;
            if ($userLat && $userLng && $pLat && $pLng) {
                $R = 6371;
                $dLat = deg2rad($pLat - $userLat);
                $dLng = deg2rad($pLng - $userLng);
                $a = sin($dLat/2)*sin($dLat/2) + cos(deg2rad($userLat))*cos(deg2rad($pLat))*sin($dLng/2)*sin($dLng/2);
                $distance = round($R * 2 * atan2(sqrt($a), sqrt(1-$a)), 1) . ' km';
            }

            // Images : profile_pic + other_pic JSON array
            $images = [];
            if ($p->profile_pic) $images[] = $p->profile_pic;
            $others = json_decode($p->other_pic ?? '[]', true) ?: [];
            foreach ($others as $img) { if ($img) $images[] = $img; }

            return [
                'profile_id'       => (string) $p->id,
                'profile_name'     => $p->name,
                'profile_bio'      => $p->profile_bio,
                'profile_age'      => $age,
                'profile_distance' => $distance ?? '0 km',
                'profile_images'   => $images,
                'is_verify'        => $p->is_verify ? 'true' : 'false',
                'match_ratio'      => 80,
                'gender'           => $p->gender,
                'height'           => $p->height,
                'lats'             => $p->lats,
                'longs'            => $p->longs,
            ];
        })->values();

        // ─── totalliked : profils qui ont liké l'utilisateur (nouveaux likes non vus) ───
        $totallikedRaw = Action::where('profile_id', $user->id)
            ->where('action', 'LIKE')
            ->pluck('uid')
            ->toArray();

        // Exclure ceux que l'utilisateur a déjà likés en retour
        $alreadyLikedBack = Action::where('uid', $user->id)
            ->whereIn('profile_id', $totallikedRaw)
            ->pluck('profile_id')
            ->toArray();

        $newLikers = array_diff($totallikedRaw, $alreadyLikedBack);

        $totallikedProfiles = [];
        if (!empty($newLikers)) {
            $totallikedProfiles = User::whereIn('id', $newLikers)
                ->where('status', 1)
                ->select(['id', 'name', 'profile_pic', 'birth_date', 'other_pic', 'is_verify'])
                ->get()
                ->map(function ($p) {
                    $images = [];
                    if ($p->profile_pic) $images[] = $p->profile_pic;
                    $others = json_decode($p->other_pic ?? '[]', true) ?: [];
                    foreach ($others as $img) { if ($img) $images[] = $img; }
                    $age = $p->birth_date ? \Carbon\Carbon::parse($p->birth_date)->age : null;
                    return [
                        'profile_id'       => (string) $p->id,
                        'profile_name'     => $p->name,
                        'profile_bio'      => '',
                        'profile_age'      => $age,
                        'profile_distance' => '0 km',
                        'profile_images'   => $images,
                        'is_verify'        => $p->is_verify ? 'true' : 'false',
                        'match_ratio'      => 80,
                        'is_subscribe'     => '0',
                    ];
                })->values()->toArray();
        }

        return response()->json([
            'ResponseCode'   => '200',
            'Result'         => 'true',
            'ResponseMsg'    => 'Home Data',
            'profilelist'    => $profilelist,
            'totalliked'     => $totallikedProfiles,
            'currency'       => $setting->currency ?? '€',
            'coin_amt'       => $setting->coin_amt ?? 0,
            'coin_fun'       => $setting->coin_fun ?? 'Enabled',
            'direct_chat'    => (string) ($user->direct_chat ?? 0),
            'Like_menu'      => ($user->plan_id && $user->plan_id > 0) ? 'Yes' : 'No',
            'audio_video'    => (string) ($user->direct_video ?? 0),
            'filter_include' => 'No',
            'plan_name'      => '',
            'plan_id'        => $user->plan_id ?? '',
            'plan_description' => '',
            'is_subscribe'   => $user->is_subscribe ? '1' : '0',
            'coin'           => (string) ($user->coin ?? 0),
            'is_verify'      => $user->is_verify ? 'true' : 'false',
            'chat'           => 'Yes',
            'setting'        => [
                'coin_amt'     => $setting->coin_amt ?? 0,
                'coin_fun'     => $setting->coin_fun ?? 'Enabled',
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

        $profilelist = $profiles->map(function ($p) {
            $age = $p->birth_date ? \Carbon\Carbon::parse($p->birth_date)->age : null;
            $images = [];
            if ($p->profile_pic) $images[] = $p->profile_pic;
            $others = json_decode($p->other_pic ?? '[]', true) ?: [];
            foreach ($others as $img) { if ($img) $images[] = $img; }
            return [
                'profile_id'       => (string) $p->id,
                'profile_name'     => $p->name,
                'profile_bio'      => $p->profile_bio,
                'profile_age'      => $age,
                'profile_distance' => '0 km',
                'profile_images'   => $images,
                'is_verify'        => $p->is_verify ? 'true' : 'false',
                'match_ratio'      => 80,
                'gender'           => $p->gender,
            ];
        })->values();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Filter Result',
            'profilelist'  => $profilelist,
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
            ->whereNotNull('profile_pic')
            ->where('profile_pic', '!=', '')
            ->select(['id', 'name', 'profile_pic', 'lats', 'longs', 'gender'])
            ->limit(100)
            ->get();

        $profilelist = $profiles->map(function ($p) {
            return [
                'profile_id'     => (string) $p->id,
                'profile_name'   => $p->name ?? 'Unknown',
                'profile_images' => [$p->profile_pic],
                'profile_lat'    => $p->lats,
                'profile_longs'  => $p->longs,
                'gender'         => $p->gender,
                'match_ratio'    => 80,
            ];
        })->values();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Map Data',
            'profilelist'  => $profilelist,
        ]);
    }
}

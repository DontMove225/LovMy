<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function info(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $user = User::find($request->uid);

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'User not found',
            ]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile Info',
            'UserData'     => $user,
        ]);
    }

    public function edit(Request $request)
    {
        $user = $request->user();

        $allowed = [
            'name', 'profile_bio', 'birth_date', 'gender',
            'lats', 'longs', 'search_preference', 'radius_search',
            'relation_goal', 'interest', 'language', 'religion',
            'height', 'direct_audio', 'direct_video', 'direct_chat',
        ];

        $user->update($request->only($allowed));

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile updated successfully!',
            'UserData'     => $user->fresh(),
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate(['image' => 'required|image|max:5120']);

        $user = $request->user();
        $path = $request->file('image')->store('images/profile', 'public');
        $url  = 'storage/' . $path;

        $user->update(['profile_pic' => $url]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile picture updated!',
            'ImagePath'    => $url,
        ]);
    }

    public function uploadOtherPhoto(Request $request)
    {
        $request->validate(['image' => 'required|image|max:5120']);

        $user      = $request->user();
        $path      = $request->file('image')->store('images/other', 'public');
        $url       = 'storage/' . $path;
        $otherPics = json_decode($user->other_pic ?? '[]', true);
        $otherPics[] = $url;
        $user->update(['other_pic' => json_encode($otherPics)]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Photo uploaded!',
            'ImagePath'    => $url,
            'AllPhotos'    => $otherPics,
        ]);
    }

    public function uploadIdentity(Request $request)
    {
        $request->validate(['image' => 'required|image|max:10240']);

        $user = $request->user();
        $path = $request->file('image')->store('images/identity', 'public');
        $url  = 'storage/' . $path;

        $user->update(['identity_picture' => $url, 'is_verify' => 0]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Identity document uploaded! Awaiting verification.',
        ]);
    }

    public function view(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'profile_id' => 'required|integer']);

        $profile = User::where('status', 1)
            ->select([
                'id', 'name', 'profile_pic', 'other_pic', 'birth_date', 'gender',
                'profile_bio', 'height', 'is_verify', 'is_subscribe',
                'relation_goal', 'interest', 'language', 'religion', 'lats', 'longs',
            ])
            ->find($request->profile_id);

        if (! $profile) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Profile not found',
            ]);
        }

        \App\Models\Action::updateOrCreate(
            ['uid' => $request->uid, 'profile_id' => $request->profile_id, 'action' => 'VIEW'],
            ['created_at' => now()]
        );

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile view recorded',
            'data'         => [
                'id'            => $profile->id,
                'name'          => $profile->name,
                'profile_pic'   => $profile->profile_pic,
                'other_pic'     => $profile->other_pic,
                'birth_date'    => $profile->birth_date,
                'gender'        => $profile->gender,
                'profile_bio'   => $profile->profile_bio,
                'height'        => $profile->height,
                'is_verify'     => $profile->is_verify,
                'is_subscribe'  => $profile->is_subscribe,
                'relation_goal' => $profile->relation_goal,
                'interest'      => $profile->interest,
                'language'      => $profile->language,
                'religion'      => $profile->religion,
                'lats'          => $profile->lats,
                'longs'         => $profile->longs,
            ],
        ]);
    }

    public function delete(Request $request)
    {
        $user = $request->user();
        $user->update(['status' => 0]);

        $user->tokens()->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Account deleted successfully',
        ]);
    }
}

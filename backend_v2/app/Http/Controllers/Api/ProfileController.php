<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // ── Used by Sanctum-protected routes ──────────────────────────────────────

    public function info(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);
        return $this->infoByUid($request);
    }

    public function edit(Request $request)
    {
        $user = $request->user();
        return $this->_doEdit($user, $request);
    }

    public function uploadPhoto(Request $request)
    {
        $user = $request->user();
        return $this->_doUploadPhoto($user, $request);
    }

    public function uploadOtherPhoto(Request $request)
    {
        $user = $request->user();
        return $this->_doUploadOtherPhoto($user, $request);
    }

    public function uploadIdentity(Request $request)
    {
        $user = $request->user();
        return $this->_doUploadIdentity($user, $request);
    }

    public function delete(Request $request)
    {
        $user = $request->user();
        return $this->_doDelete($user);
    }

    // ── Used by uid-based routes (no Sanctum token needed) ────────────────────

    public function infoByUid(Request $request)
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

    public function editByUid(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);
        $user = User::find($request->uid);
        if (! $user) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        }
        return $this->_doEdit($user, $request);
    }

    public function uploadPhotoByUid(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'image' => 'required|image|max:5120']);
        $user = User::find($request->uid);
        if (! $user) return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        return $this->_doUploadPhoto($user, $request);
    }

    public function uploadOtherPhotoByUid(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'image' => 'required|image|max:5120']);
        $user = User::find($request->uid);
        if (! $user) return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        return $this->_doUploadOtherPhoto($user, $request);
    }

    public function uploadIdentityByUid(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'image' => 'required|image|max:10240']);
        $user = User::find($request->uid);
        if (! $user) return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        return $this->_doUploadIdentity($user, $request);
    }

    public function deleteByUid(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);
        $user = User::find($request->uid);
        if (! $user) return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'User not found']);
        return $this->_doDelete($user);
    }

    public function view(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'profile_id' => 'required|integer']);

        \App\Models\Action::updateOrCreate(
            ['uid' => $request->uid, 'profile_id' => $request->profile_id, 'action' => 'VIEW'],
            ['created_at' => now()]
        );

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile view recorded',
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private function _doEdit(User $user, Request $request)
    {
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

    private function _doUploadPhoto(User $user, Request $request)
    {
        $path = $request->file('image')->store('images/profile', 'public');
        $url  = Storage::url($path);
        $user->update(['profile_pic' => $url]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile picture updated!',
            'ImagePath'    => $url,
        ]);
    }

    private function _doUploadOtherPhoto(User $user, Request $request)
    {
        $path      = $request->file('image')->store('images/other', 'public');
        $url       = Storage::url($path);
        $otherPics = json_decode($user->other_pic ?? '[]', true) ?: [];
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

    private function _doUploadIdentity(User $user, Request $request)
    {
        $path = $request->file('image')->store('images/identity', 'public');
        $url  = Storage::url($path);
        $user->update(['identity_picture' => $url, 'is_verify' => 0]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Identity document uploaded! Awaiting verification.',
        ]);
    }

    private function _doDelete(User $user)
    {
        $user->update(['status' => 0]);
        $user->tokens()->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Account deleted successfully',
        ]);
    }
}

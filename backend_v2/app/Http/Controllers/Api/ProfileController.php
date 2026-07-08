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
        $request->validate(['uid' => 'required|integer']);
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

        $profile = User::where('status', 1)->find($request->profile_id);

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
        // Accepte soit un fichier multipart (image) soit du base64 (img)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images/profile', 'public');
        } elseif ($request->img) {
            // Décoder le base64 et sauvegarder
            $base64 = $request->img;
            // Supprimer le préfixe data:image/...;base64, si présent
            if (str_contains($base64, ',')) {
                $base64 = substr($base64, strpos($base64, ',') + 1);
            }
            $imageData = base64_decode($base64);
            $filename  = 'images/profile/' . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $imageData);
            $path = $filename;
        } else {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'No image provided',
            ]);
        }

        // Stocker uniquement le chemin relatif (ex: /storage/images/profile/xxx.jpg)
        // Flutter concatene Config.baseUrl + profilePic, donc il ne faut PAS l'URL absolue
        $relativePath = 'storage/' . $path;
        $user->update(['profile_pic' => $relativePath]);
        $fresh = $user->fresh();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Profile picture updated!',
            'ImagePath'    => $relativePath,
            'UserLogin'    => $fresh,
        ]);
    }

    private function _doUploadOtherPhoto(User $user, Request $request)
    {
        $path      = $request->file('image')->store('images/other', 'public');
        $relativePath = 'storage/' . $path;
        $otherPics = json_decode($user->other_pic ?? '[]', true) ?: [];
        $otherPics[] = $relativePath;
        $user->update(['other_pic' => json_encode($otherPics)]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Photo uploaded!',
            'ImagePath'    => $relativePath,
            'AllPhotos'    => $otherPics,
        ]);
    }

    private function _doUploadIdentity(User $user, Request $request)
    {
        $path = $request->file('image')->store('images/identity', 'public');
        $relativePath = 'storage/' . $path;
        $user->update(['identity_picture' => $relativePath, 'is_verify' => 0]);

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

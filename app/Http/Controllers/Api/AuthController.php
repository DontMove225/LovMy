<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Setting;
use App\Models\User;
use App\Models\CoinReport;
use App\Models\WalletReport;
use App\Services\Msg91Service;
use App\Services\SocialAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'mobile'   => 'required|string',
            'password' => 'required|string',
            'ccode'    => 'nullable|string',
        ]);

        $user = User::where(function ($q) use ($request) {
            $q->where('mobile', $request->mobile)
              ->orWhere('email', $request->mobile);
        })->where('status', 1)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid Email/Mobile No or Password!!!',
            ]);
        }

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Login successfully!',
            'UserLogin'    => $user->load('plan:id,title'),
            'token'        => $token,
        ]);
    }

    public function register(Request $request, Msg91Service $msg91)
    {
        $request->validate([
            'name'          => 'required|string',
            'mobile'        => 'required|string',
            'password'      => 'required|string',
            'ccode'         => 'nullable|string',
            'email'         => 'nullable|email',
            'gender'        => 'nullable|in:MALE,FEMALE,OTHER',
            'birth_date'    => 'nullable|date',
        ]);

        $exists = User::where('mobile', $request->mobile)
            ->orWhere(function ($q) use ($request) {
                if ($request->email) {
                    $q->where('email', $request->email);
                }
            })->first();

        if ($exists) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Mobile number already registered!',
            ]);
        }

        if (! $msg91->sendOtp($request->mobile)) {
            return response()->json([
                'ResponseCode' => '500',
                'Result'       => 'false',
                'ResponseMsg'  => "Impossible d'envoyer le code de vérification par SMS. Réessayez.",
            ]);
        }

        $setting = Setting::current();
        $referCode = rand(100000, 999999);

        $user = User::create([
            'name'       => $request->name,
            'mobile'     => $request->mobile,
            'password'   => Hash::make($request->password),
            'ccode'      => $request->ccode ?? '',
            'email'      => $request->email ?? '',
            'gender'     => $request->gender ?? 'MALE',
            'birth_date' => $request->birth_date,
            'code'       => $referCode,
            'status'     => 0,
            'coin'       => $setting->scredit ?? 0,
            'wallet'     => 0,
            'lats'       => '',
            'longs'      => '',
            'search_preference' => 'FEMALE',
            'radius_search'     => '50',
            'relation_goal'     => 0,
            'interest'          => '[]',
            'language'          => '[]',
            'religion'          => 0,
            'other_pic'         => '[]',
            'rdate'             => now(),
        ]);

        if (($setting->scredit ?? 0) > 0) {
            CoinReport::create([
                'uid'     => $user->id,
                'message' => 'Register Bonus',
                'status'  => 'Credit',
                'amt'     => $setting->scredit,
                'tdate'   => now()->toDateString(),
            ]);
        }

        if ($request->refercode) {
            $referrer = User::where('code', $request->refercode)->first();
            if ($referrer) {
                $referrer->increment('coin', $setting->rcredit ?? 0);
                CoinReport::create([
                    'uid'     => $referrer->id,
                    'message' => 'Referral Bonus',
                    'status'  => 'Credit',
                    'amt'     => $setting->rcredit,
                    'tdate'   => now()->toDateString(),
                ]);
            }
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Code de vérification envoyé par SMS',
            'mobile'       => $user->mobile,
        ], 201);
    }

    public function verifyRegistrationOtp(Request $request, Msg91Service $msg91)
    {
        $request->validate([
            'mobile' => 'required|string',
            'otp'    => 'required|string',
        ]);

        $user = User::where('mobile', $request->mobile)->first();

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'User not found',
            ]);
        }

        if (! $msg91->verifyOtp($request->mobile, $request->otp)) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Code invalide ou expiré',
            ]);
        }

        $user->update(['status' => 1]);
        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Compte vérifié avec succès !',
            'UserLogin'    => $user->load('plan:id,title'),
            'token'        => $token,
        ]);
    }

    public function resendRegistrationOtp(Request $request, Msg91Service $msg91)
    {
        $request->validate(['mobile' => 'required|string']);

        if (! $msg91->resendOtp($request->mobile)) {
            return response()->json([
                'ResponseCode' => '500',
                'Result'       => 'false',
                'ResponseMsg'  => "Impossible de renvoyer le code. Réessayez.",
            ]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Code renvoyé par SMS',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Logged out successfully',
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'      => 'required|string|min:8',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Mot de passe actuel incorrect.',
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Mot de passe modifié avec succès.',
        ]);
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate(['fcm_token' => 'required|string']);

        $request->user()->update(['fcm_token' => $request->fcm_token]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Token enregistré.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'UserData'     => $request->user()->load('plan:id,title'),
        ]);
    }

    public function mobileCheck(Request $request)
    {
        $request->validate(['mobile' => 'required|string']);

        $exists = User::where('mobile', $request->mobile)->exists();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => $exists ? 'true' : 'false',
            'ResponseMsg'  => $exists ? 'Mobile already registered' : 'Mobile available',
        ]);
    }

    public function emailCheck(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => $exists ? 'false' : 'true',
            'ResponseMsg'  => $exists ? 'Cette adresse e-mail est déjà utilisée' : 'Email disponible',
        ]);
    }

    public function sendForgotPasswordOtp(Request $request, Msg91Service $msg91)
    {
        $request->validate(['mobile' => 'required|string']);

        $user = User::where('mobile', $request->mobile)
            ->orWhere('email', $request->mobile)
            ->first();

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'No account found with this mobile/email',
            ]);
        }

        if (! $msg91->sendOtp($user->mobile)) {
            return response()->json([
                'ResponseCode' => '500',
                'Result'       => 'false',
                'ResponseMsg'  => "Impossible d'envoyer le code de vérification par SMS. Réessayez.",
            ]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Code de vérification envoyé par SMS',
            'mobile'       => $user->mobile,
        ]);
    }

    public function forgetPassword(Request $request, Msg91Service $msg91)
    {
        $request->validate([
            'mobile'   => 'required|string',
            'otp'      => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('mobile', $request->mobile)
            ->orWhere('email', $request->mobile)
            ->first();

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'No account found with this mobile/email',
            ]);
        }

        if (! $msg91->verifyOtp($user->mobile, $request->otp)) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Code invalide ou expiré',
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Password updated successfully!',
        ]);
    }

    public function socialLogin(Request $request, SocialAuthService $social)
    {
        $request->validate([
            'provider' => 'required|in:google,facebook',
            'token'    => 'required|string',
        ]);

        $profile = $request->provider === 'google'
            ? $social->verifyGoogleToken($request->token)
            : $social->verifyFacebookToken($request->token);

        if (! $profile) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Impossible de vérifier votre compte '.ucfirst($request->provider).'.',
            ]);
        }

        $column = $request->provider === 'google' ? 'google_id' : 'facebook_id';

        $user = User::where($column, $profile['provider_id'])->first()
            ?? User::where('email', $profile['email'])->first();

        if ($user) {
            if (! $user->{$column}) {
                $user->update([$column => $profile['provider_id']]);
            }
        } else {
            $setting = Setting::current();
            $referCode = rand(100000, 999999);

            $user = User::create([
                'name'              => $profile['name'],
                'email'             => $profile['email'],
                $column             => $profile['provider_id'],
                'password'          => Hash::make(Str::random(40)),
                'status'            => 1,
                'code'              => $referCode,
                'coin'              => $setting->scredit ?? 0,
                'gender'            => 'MALE',
                'search_preference' => 'FEMALE',
                'radius_search'     => '50',
                'relation_goal'     => 0,
                'interest'          => '[]',
                'language'          => '[]',
                'religion'          => 0,
                'other_pic'         => '[]',
                'rdate'             => now(),
            ]);

            if (($setting->scredit ?? 0) > 0) {
                CoinReport::create([
                    'uid'     => $user->id,
                    'message' => 'Register Bonus',
                    'status'  => 'Credit',
                    'amt'     => $setting->scredit,
                    'tdate'   => now()->toDateString(),
                ]);
            }
        }

        if ($user->status == 0) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Compte suspendu.',
            ]);
        }

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Login successfully!',
            'UserLogin'    => $user->load('plan:id,title'),
            'token'        => $token,
        ]);
    }

    public function adminLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'username' => ['Invalid credentials.'],
            ]);
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => ['id' => $admin->id, 'username' => $admin->username, 'role' => 'admin'],
        ]);
    }
}

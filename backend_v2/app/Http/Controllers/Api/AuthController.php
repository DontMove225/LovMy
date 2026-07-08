<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Setting;
use App\Models\User;
use App\Models\CoinReport;
use App\Models\WalletReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        if (! $user) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid Email/Mobile No or Password!!!',
            ]);
        }

        // Supporte les deux formats : bcrypt (nouveau) et plain text (ancienne migration)
        $passwordValid = false;
        try {
            $passwordValid = \Illuminate\Support\Facades\Hash::check($request->password, $user->password);
        } catch (\RuntimeException $e) {
            // Le hash n'est pas bcrypt — comparer en plain text (anciens comptes migrés)
            $passwordValid = ($user->password === $request->password);
        }

        if (! $passwordValid) {
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
            'UserLogin'    => $user,
            'token'        => $token,
        ]);
    }

    public function register(Request $request)
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

        $exists = User::where('mobile', $request->mobile)->first();

        if (! $exists && $request->email) {
            $exists = User::where('email', $request->email)->first();
        }

        if ($exists) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Mobile number already registered!',
            ]);
        }

        $setting = Setting::current();
        $referCode = rand(100000, 999999);

        $user = User::create([
            'name'       => $request->name,
            'mobile'     => $request->mobile,
            'password'   => $request->password,
            'ccode'      => $request->ccode ?? '',
            'email'      => $request->email ?? '',
            'gender'     => $request->gender ?? 'MALE',
            'birth_date' => $request->birth_date,
            'code'       => $referCode,
            'status'     => 1,
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

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Register Successfully!',
            'UserLogin'    => $user,
            'token'        => $token,
        ], 200);
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

    public function me(Request $request)
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'UserData'     => $request->user(),
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

    public function forgetPassword(Request $request)
    {
        $request->validate([
            'mobile'   => 'required|string',
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

        $user->update(['password' => $request->password]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Password updated successfully!',
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

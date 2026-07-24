<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class EnsureTechnicalPassword
{
    public function handle(Request $request, Closure $next): Response
    {
        $setting  = Setting::current();
        $supplied = $request->header('X-Tech-Password');

        if (! $setting->tech_password || ! $supplied || ! Hash::check($supplied, $setting->tech_password)) {
            return response()->json([
                'ResponseCode' => '403',
                'Result'       => 'false',
                'ResponseMsg'  => 'Mot de passe technique requis ou invalide.',
            ], 403);
        }

        return $next($request);
    }
}

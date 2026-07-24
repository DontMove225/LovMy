<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class SocialAuthService
{
    /**
     * Verify a Google ID token and return the normalized profile, or null if invalid.
     */
    public function verifyGoogleToken(string $idToken): ?array
    {
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (! $response->ok()) {
            return null;
        }

        $payload = $response->json();

        $clientId = Setting::current()->google_client_id;
        if (! $clientId || ($payload['aud'] ?? null) !== $clientId) {
            return null;
        }

        if (! in_array($payload['iss'] ?? null, ['accounts.google.com', 'https://accounts.google.com'], true)) {
            return null;
        }

        if (empty($payload['email']) || ($payload['email_verified'] ?? 'false') !== 'true') {
            return null;
        }

        return [
            'provider_id' => $payload['sub'],
            'email'       => $payload['email'],
            'name'        => $payload['name'] ?? $payload['given_name'] ?? 'Google User',
            'avatar'      => $payload['picture'] ?? null,
        ];
    }

    /**
     * Verify a Facebook access token and return the normalized profile, or null if invalid.
     */
    public function verifyFacebookToken(string $accessToken): ?array
    {
        $setting = Setting::current();
        $appId = $setting->facebook_app_id;
        $appSecret = $setting->facebook_app_secret;

        if (! $appId || ! $appSecret) {
            return null;
        }

        $debug = Http::get('https://graph.facebook.com/debug_token', [
            'input_token'  => $accessToken,
            'access_token' => "{$appId}|{$appSecret}",
        ]);

        if (! $debug->ok()) {
            return null;
        }

        $data = $debug->json('data') ?? [];

        if (! ($data['is_valid'] ?? false) || (string) ($data['app_id'] ?? '') !== (string) $appId) {
            return null;
        }

        $profile = Http::get('https://graph.facebook.com/me', [
            'fields'       => 'id,name,email,picture',
            'access_token' => $accessToken,
        ]);

        if (! $profile->ok()) {
            return null;
        }

        $user = $profile->json();

        if (empty($user['email'])) {
            return null;
        }

        return [
            'provider_id' => $user['id'],
            'email'       => $user['email'],
            'name'        => $user['name'] ?? 'Facebook User',
            'avatar'      => $user['picture']['data']['url'] ?? null,
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper around MSG91's OTP Widget API (v5). MSG91 generates, stores and
 * expires the OTP itself — we only relay send/verify/resend calls, no local
 * OTP storage needed. Credentials (authkey, OTP template id) come from the
 * `tbl_setting` row, configurable in the admin panel.
 */
class Msg91Service
{
    private const BASE_URL = 'https://control.msg91.com/api/v5/otp';
    private const TIMEOUT_SECONDS = 8;

    public function sendOtp(string $mobile): bool
    {
        $setting = Setting::current();

        $url = self::BASE_URL . '?' . http_build_query([
            'template_id' => $setting->otp_id,
            'mobile'      => $mobile,
        ]);

        $response = $this->post($url, $setting->auth_key);

        return ($response['type'] ?? null) === 'success';
    }

    public function verifyOtp(string $mobile, string $otp): bool
    {
        $setting = Setting::current();

        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['authkey' => $setting->auth_key])
                ->get(self::BASE_URL . '/verify', [
                    'mobile' => $mobile,
                    'otp'    => $otp,
                ]);
        } catch (ConnectionException $e) {
            Log::warning('MSG91 verifyOtp connection failure', ['message' => $e->getMessage()]);

            return false;
        }

        return $response->json('type') === 'success';
    }

    public function resendOtp(string $mobile, string $retryType = 'text'): bool
    {
        $setting = Setting::current();

        $url = self::BASE_URL . '/retry?' . http_build_query([
            'mobile'    => $mobile,
            'retrytype' => $retryType,
        ]);

        $response = $this->post($url, $setting->auth_key);

        return ($response['type'] ?? null) === 'success';
    }

    private function post(string $url, string $authKey): array
    {
        try {
            return Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['authkey' => $authKey])
                ->post($url)
                ->json() ?? [];
        } catch (ConnectionException $e) {
            Log::warning('MSG91 request connection failure', ['url' => $url, 'message' => $e->getMessage()]);

            return [];
        }
    }
}

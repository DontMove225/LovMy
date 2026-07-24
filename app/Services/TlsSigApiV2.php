<?php

namespace App\Services;

/**
 * Tencent Cloud TLS-SIG-API v2 — generates the UserSig required by the TRTC SDK.
 * Ported from Tencent's official reference algorithm.
 */
class TlsSigApiV2
{
    public function __construct(
        private readonly int $sdkAppId,
        private readonly string $secretKey,
    ) {
    }

    public function genUserSig(string $userId, int $expireSeconds = 604800): string
    {
        $currentTime = time();

        $signature = $this->hmacSha256($userId, $currentTime, $expireSeconds);
        if ($signature === '') {
            return '';
        }

        $sigDoc = [
            'TLS.ver'        => '2.0',
            'TLS.identifier'  => $userId,
            'TLS.sdkappid'    => $this->sdkAppId,
            'TLS.expire'      => $expireSeconds,
            'TLS.time'        => $currentTime,
            'TLS.sig'         => $signature,
        ];

        $json = json_encode($sigDoc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $compressed = gzdeflate($json);

        return $this->base64Url($compressed);
    }

    private function hmacSha256(string $userId, int $currentTime, int $expire): string
    {
        $content = "TLS.identifier:{$userId}\n"
            . "TLS.sdkappid:{$this->sdkAppId}\n"
            . "TLS.time:{$currentTime}\n"
            . "TLS.expire:{$expire}\n";

        return base64_encode(hash_hmac('sha256', $content, $this->secretKey, true));
    }

    private function base64Url(string $binary): string
    {
        $encoded = base64_encode($binary);

        return strtr($encoded, ['+' => '*', '/' => '-', '=' => '_']);
    }
}

<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;

class FirebaseNotificationService
{
    public function isConfigured(): bool
    {
        return filled(Setting::current()->firebase_credentials);
    }

    /**
     * Best-effort push to a batch of device tokens. Never throws: a push
     * failure must not break the in-app notification it accompanies.
     *
     * Firebase accepts a multicast call without throwing even when every
     * individual token fails (e.g. a stale/unregistered device) — the
     * failures only show up in the send report, so we must inspect it
     * explicitly instead of relying on a caught exception.
     */
    public function sendToTokens(array $tokens, string $title, string $body): void
    {
        $tokens = array_values(array_unique(array_filter($tokens)));

        if (! $tokens || ! $this->isConfigured()) {
            return;
        }

        try {
            $message = CloudMessage::new()->withNotification(FirebaseNotification::create($title, $body));

            $report = $this->messaging()->sendMulticast($message, $tokens);

            $staleTokens = [];
            foreach ($report->failures()->getItems() as $failure) {
                $failedToken = $failure->target()->value();
                Log::warning('Firebase push delivery failed for token', [
                    'token' => substr($failedToken, 0, 12).'…',
                    'error' => $failure->error()->getMessage(),
                ]);
                $staleTokens[] = $failedToken;
            }

            if ($staleTokens) {
                User::whereIn('fcm_token', $staleTokens)->update(['fcm_token' => null]);
            }
        } catch (\Throwable $e) {
            Log::error('Firebase push notification failed', ['error' => $e->getMessage()]);
        }
    }

    private function messaging(): Messaging
    {
        $credentials = json_decode(Setting::current()->firebase_credentials, true, 512, JSON_THROW_ON_ERROR);

        return (new Factory())->withServiceAccount($credentials)->createMessaging();
    }
}

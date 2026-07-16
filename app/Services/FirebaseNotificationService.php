<?php

namespace App\Services;

use App\Models\Setting;
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
     */
    public function sendToTokens(array $tokens, string $title, string $body): void
    {
        $tokens = array_values(array_unique(array_filter($tokens)));

        if (! $tokens || ! $this->isConfigured()) {
            return;
        }

        try {
            $message = CloudMessage::new()->withNotification(FirebaseNotification::create($title, $body));

            $this->messaging()->sendMulticast($message, $tokens);
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

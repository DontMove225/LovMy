<?php

namespace App\Jobs;

use App\Services\FirebaseNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  string[]  $tokens
     */
    public function __construct(
        public readonly array $tokens,
        public readonly string $title,
        public readonly string $body,
    ) {
    }

    public function handle(FirebaseNotificationService $firebase): void
    {
        $firebase->sendToTokens($this->tokens, $this->title, $this->body);
    }
}

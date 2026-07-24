<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotificationJob;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PushNotificationTest extends TestCase
{
    /**
     * tbl_user / admins run on MyISAM, which ignores transactions, so
     * clean up explicitly rather than relying on DatabaseTransactions.
     */
    private const TEST_EMAILS = [
        'push-target@example.com',
        'push-no-token@example.com',
    ];

    private array $createdAdminIds = [];

    protected function tearDown(): void
    {
        User::whereIn('email', self::TEST_EMAILS)->delete();
        Admin::whereIn('id', $this->createdAdminIds)->delete();

        parent::tearDown();
    }

    private function actingAsAdmin(): Admin
    {
        $admin = Admin::factory()->create();
        $this->createdAdminIds[] = $admin->id;
        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_targeted_notification_dispatches_push_when_user_has_token(): void
    {
        Bus::fake();
        $this->actingAsAdmin();

        $user = User::create([
            'name'      => 'Push Target',
            'email'     => 'push-target@example.com',
            'password'  => bcrypt('secret'),
            'status'    => 1,
            'gender'    => 'MALE',
            'fcm_token' => 'device-token-123',
            'rdate'     => now(),
        ]);

        $response = $this->postJson('/api/admin/notifications', [
            'title'       => 'Hello',
            'description' => 'World',
            'uid'         => $user->id,
        ]);

        $response->assertOk()->assertJson(['Result' => 'true']);

        Bus::assertDispatched(
            SendPushNotificationJob::class,
            fn ($job) => $job->tokens === ['device-token-123'] && $job->title === 'Hello' && $job->body === 'World'
        );

        $this->assertDatabaseHas('tbl_notification', ['uid' => $user->id, 'title' => 'Hello']);
    }

    public function test_targeted_notification_skips_push_when_user_has_no_token(): void
    {
        Bus::fake();
        $this->actingAsAdmin();

        $user = User::create([
            'name'     => 'No Token',
            'email'    => 'push-no-token@example.com',
            'password' => bcrypt('secret'),
            'status'   => 1,
            'gender'   => 'MALE',
            'rdate'    => now(),
        ]);

        $this->postJson('/api/admin/notifications', [
            'title'       => 'Hello',
            'description' => 'World',
            'uid'         => $user->id,
        ])->assertOk();

        Bus::assertNotDispatched(SendPushNotificationJob::class);
    }

    public function test_fcm_token_registration_updates_user(): void
    {
        $user = User::create([
            'name'     => 'Push Target',
            'email'    => 'push-target@example.com',
            'password' => bcrypt('secret'),
            'status'   => 1,
            'gender'   => 'MALE',
            'rdate'    => now(),
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/fcm-token', ['fcm_token' => 'new-token-456'])
            ->assertOk()
            ->assertJson(['Result' => 'true']);

        $this->assertDatabaseHas('tbl_user', ['id' => $user->id, 'fcm_token' => 'new-token-456']);
    }
}

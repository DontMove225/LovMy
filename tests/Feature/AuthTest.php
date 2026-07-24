<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_mobile_check_returns_available_for_new_number(): void
    {
        $response = $this->postJson('/api/mobile_check.php', [
            'mobile' => '0000000000',
        ]);

        $response->assertOk()
            ->assertJson([
                'ResponseCode' => '200',
                'Result'       => 'false',
            ]);
    }

    public function test_sms_type_returns_all_required_fields(): void
    {
        $response = $this->getJson('/api/sms_type.php');

        $response->assertOk()
            ->assertJsonStructure([
                'ResponseCode',
                'Result',
                'SMS_TYPE',
                'Admob_Enabled',
                'maintainance_Enabled',
                'Social_login_enabled',
            ]);
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $user = User::create([
            'name'     => 'Password Test',
            'email'    => 'password-test@example.com',
            'password' => Hash::make('correct-password'),
            'status'   => 1,
            'gender'   => 'MALE',
            'rdate'    => now(),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/change-password', [
            'current_password' => 'wrong-password',
            'new_password'     => 'new-password-123',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '401',
            'Result'       => 'false',
        ]);
        $this->assertTrue(Hash::check('correct-password', $user->fresh()->password));

        $user->delete();
    }

    public function test_change_password_updates_password_when_current_is_correct(): void
    {
        $user = User::create([
            'name'     => 'Password Test 2',
            'email'    => 'password-test-2@example.com',
            'password' => Hash::make('correct-password'),
            'status'   => 1,
            'gender'   => 'MALE',
            'rdate'    => now(),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/auth/change-password', [
            'current_password' => 'correct-password',
            'new_password'     => 'new-password-123',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '200',
            'Result'       => 'true',
        ]);
        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));

        $user->delete();
    }
}

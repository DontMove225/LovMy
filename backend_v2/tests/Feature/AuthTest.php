<?php

namespace Tests\Feature;

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
}

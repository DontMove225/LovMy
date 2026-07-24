<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    /**
     * tbl_user runs on MyISAM, which ignores transactions, so
     * DatabaseTransactions would silently leak rows into the real
     * database. Clean up explicitly by known test identifiers instead.
     */
    private const TEST_EMAILS = [
        'newgoogleuser@example.com',
        'existing@example.com',
        'attacker@example.com',
        'fbuser@example.com',
    ];

    private array $originalSettings = [];

    protected function setUp(): void
    {
        parent::setUp();

        $setting = Setting::current();
        $this->originalSettings = [
            'google_client_id'    => $setting->google_client_id,
            'facebook_app_id'     => $setting->facebook_app_id,
            'facebook_app_secret' => $setting->facebook_app_secret,
        ];

        $setting->fill([
            'google_client_id'    => 'test-google-client-id',
            'facebook_app_id'     => 'test-fb-app-id',
            'facebook_app_secret' => 'test-fb-app-secret',
        ])->save();
    }

    protected function tearDown(): void
    {
        User::whereIn('email', self::TEST_EMAILS)->delete();
        Setting::current()->fill($this->originalSettings)->save();

        parent::tearDown();
    }

    public function test_rejects_unknown_provider(): void
    {
        $response = $this->postJson('/api/auth/social', [
            'provider' => 'twitter',
            'token'    => 'whatever',
        ]);

        $response->assertStatus(422);
    }

    public function test_google_login_creates_new_user(): void
    {
        Http::fake([
            'oauth2.googleapis.com/tokeninfo*' => Http::response([
                'aud'            => 'test-google-client-id',
                'iss'            => 'https://accounts.google.com',
                'sub'            => 'google-sub-123',
                'email'          => 'newgoogleuser@example.com',
                'email_verified' => 'true',
                'name'           => 'Google User',
                'picture'        => 'https://example.com/pic.jpg',
            ]),
        ]);

        $response = $this->postJson('/api/auth/social', [
            'provider' => 'google',
            'token'    => 'valid-id-token',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '200',
            'Result'       => 'true',
        ]);
        $response->assertJsonPath('UserLogin.email', 'newgoogleuser@example.com');
        $response->assertJsonStructure(['token']);

        $this->assertDatabaseHas('tbl_user', [
            'email'     => 'newgoogleuser@example.com',
            'google_id' => 'google-sub-123',
        ]);
    }

    public function test_google_login_links_existing_account_by_email(): void
    {
        $user = User::create([
            'name'     => 'Existing User',
            'email'    => 'existing@example.com',
            'password' => bcrypt('some-password'),
            'status'   => 1,
            'gender'   => 'MALE',
            'rdate'    => now(),
        ]);

        $countBefore = User::count();

        Http::fake([
            'oauth2.googleapis.com/tokeninfo*' => Http::response([
                'aud'            => 'test-google-client-id',
                'iss'            => 'accounts.google.com',
                'sub'            => 'google-sub-456',
                'email'          => 'existing@example.com',
                'email_verified' => 'true',
                'name'           => 'Existing User',
            ]),
        ]);

        $response = $this->postJson('/api/auth/social', [
            'provider' => 'google',
            'token'    => 'valid-id-token',
        ]);

        $response->assertOk()->assertJson(['Result' => 'true']);
        $response->assertJsonPath('UserLogin.id', $user->id);

        $this->assertDatabaseHas('tbl_user', [
            'id'        => $user->id,
            'google_id' => 'google-sub-456',
        ]);
        $this->assertSame($countBefore, User::count());
    }

    public function test_google_login_rejects_wrong_audience(): void
    {
        Http::fake([
            'oauth2.googleapis.com/tokeninfo*' => Http::response([
                'aud'            => 'someone-elses-client-id',
                'iss'            => 'https://accounts.google.com',
                'sub'            => 'google-sub-789',
                'email'          => 'attacker@example.com',
                'email_verified' => 'true',
            ]),
        ]);

        $response = $this->postJson('/api/auth/social', [
            'provider' => 'google',
            'token'    => 'forged-token',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '401',
            'Result'       => 'false',
        ]);
        $this->assertDatabaseMissing('tbl_user', ['email' => 'attacker@example.com']);
    }

    public function test_facebook_login_creates_new_user(): void
    {
        Http::fake([
            'graph.facebook.com/debug_token*' => Http::response([
                'data' => [
                    'is_valid' => true,
                    'app_id'   => 'test-fb-app-id',
                ],
            ]),
            'graph.facebook.com/me*' => Http::response([
                'id'      => 'fb-id-123',
                'name'    => 'FB User',
                'email'   => 'fbuser@example.com',
                'picture' => ['data' => ['url' => 'https://example.com/fb.jpg']],
            ]),
        ]);

        $response = $this->postJson('/api/auth/social', [
            'provider' => 'facebook',
            'token'    => 'valid-access-token',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '200',
            'Result'       => 'true',
        ]);
        $this->assertDatabaseHas('tbl_user', [
            'email'       => 'fbuser@example.com',
            'facebook_id' => 'fb-id-123',
        ]);
    }

    public function test_facebook_login_rejects_invalid_token(): void
    {
        Http::fake([
            'graph.facebook.com/debug_token*' => Http::response([
                'data' => ['is_valid' => false, 'app_id' => 'test-fb-app-id'],
            ]),
        ]);

        $response = $this->postJson('/api/auth/social', [
            'provider' => 'facebook',
            'token'    => 'invalid-token',
        ]);

        $response->assertOk()->assertJson([
            'ResponseCode' => '401',
            'Result'       => 'false',
        ]);
    }
}

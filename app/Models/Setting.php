<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'tbl_setting';
    public $timestamps = false;

    public const TECHNICAL_FIELDS = [
        'auth_key', 'otp_id', 'map_key', 'agora_app_id',
        'trtc_sdk_app_id', 'trtc_secret_key',
        'stripe_key', 'stripe_secret',
        'paypal_client_id', 'paypal_client_secret',
    ];

    public const COMMUNICATION_FIELDS = [
        'webname', 'weblogo', 'timezone', 'currency', 'one_key', 'one_hash',
        'show_dark', 'sms_type', 'acc_id', 'auth_token', 'twilio_number', 'admob',
        'slogin', 'mode', 'banner_id', 'in_id', 'fmode', 'coin_amt', 'otp_auth',
        'coin_limit', 'coin_fun', 'scredit', 'rcredit', 'ios_banner_id', 'ios_in_id',
    ];

    protected $fillable = [
        'webname', 'weblogo', 'timezone', 'currency', 'one_key', 'one_hash',
        'show_dark', 'sms_type', 'auth_key', 'otp_id', 'acc_id', 'auth_token',
        'twilio_number', 'admob', 'slogin', 'mode', 'banner_id', 'in_id', 'fmode',
        'map_key', 'coin_amt', 'otp_auth', 'coin_limit', 'coin_fun', 'agora_app_id',
        'scredit', 'rcredit', 'ios_banner_id', 'ios_in_id',
        'trtc_sdk_app_id', 'trtc_secret_key', 'stripe_key', 'stripe_secret',
        'paypal_client_id', 'paypal_client_secret', 'tech_password',
    ];

    protected $hidden = [
        'one_key', 'one_hash', 'auth_key', 'otp_id', 'acc_id', 'auth_token',
        'twilio_number', 'map_key', 'agora_app_id',
        'trtc_sdk_app_id', 'trtc_secret_key', 'stripe_key', 'stripe_secret',
        'paypal_client_id', 'paypal_client_secret', 'tech_password',
    ];

    protected $casts = [
        'auth_key'             => 'encrypted',
        'otp_id'               => 'encrypted',
        'map_key'              => 'encrypted',
        'agora_app_id'         => 'encrypted',
        'trtc_sdk_app_id'      => 'encrypted',
        'trtc_secret_key'      => 'encrypted',
        'stripe_key'           => 'encrypted',
        'stripe_secret'        => 'encrypted',
        'paypal_client_id'     => 'encrypted',
        'paypal_client_secret' => 'encrypted',
        'tech_password'        => 'hashed',
    ];

    public static function current(): self
    {
        return self::firstOrNew(['id' => 1]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'tbl_setting';
    public $timestamps = false;

    protected $fillable = [
        'webname', 'weblogo', 'timezone', 'currency', 'one_key', 'one_hash',
        'show_dark', 'sms_type', 'auth_key', 'otp_id', 'acc_id', 'auth_token',
        'twilio_number', 'admob', 'slogin', 'mode', 'banner_id', 'in_id', 'fmode',
        'map_key', 'coin_amt', 'otp_auth', 'coin_limit', 'coin_fun', 'agora_app_id',
        'scredit', 'rcredit', 'ios_banner_id', 'ios_in_id',
    ];

    protected $hidden = [
        'one_key', 'one_hash', 'auth_key', 'otp_id', 'acc_id', 'auth_token',
        'twilio_number', 'map_key', 'agora_app_id',
    ];

    public static function current(): self
    {
        return self::firstOrNew(['id' => 1]);
    }
}

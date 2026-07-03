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
        $setting = self::first();
        if ($setting) {
            return $setting;
        }

        // Retourner un objet Setting avec des valeurs par défaut
        // si la table est vide (évite les erreurs null sur les champs text)
        $default = new self();
        $default->webname     = 'LovMy';
        $default->weblogo     = '';
        $default->timezone    = 'UTC';
        $default->currency    = '€';
        $default->one_key     = '';
        $default->one_hash    = '';
        $default->show_dark   = 0;
        $default->sms_type    = '0';
        $default->auth_key    = '';
        $default->otp_id      = '';
        $default->acc_id      = '';
        $default->auth_token  = '';
        $default->twilio_number = '';
        $default->admob       = 'No';
        $default->slogin      = 'No';
        $default->mode        = 'Test';
        $default->banner_id   = '';
        $default->in_id       = '';
        $default->fmode       = 'No';
        $default->map_key     = '';
        $default->coin_amt    = 1.0;
        $default->otp_auth    = 'No';
        $default->coin_limit  = 0.0;
        $default->coin_fun    = 'Enabled';
        $default->agora_app_id = '';
        $default->scredit     = 0;
        $default->rcredit     = 0;
        $default->ios_banner_id = '';
        $default->ios_in_id   = '';
        return $default;
    }
}

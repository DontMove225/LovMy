<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_setting')->insertOrIgnore([[
            'id'            => 1,
            'webname'       => 'LovMy',
            'weblogo'       => 'images/website/logo.png',
            'timezone'      => 'Europe/Paris',
            'currency'      => '€',
            'one_key'       => '',
            'one_hash'      => '',
            'show_dark'     => 0,
            'sms_type'      => '',
            'auth_key'      => '',
            'otp_id'        => '',
            'acc_id'        => '',
            'auth_token'    => '',
            'twilio_number' => '',
            'admob'         => 'Yes',
            'slogin'        => '',
            'mode'          => 'No',
            'banner_id'     => 'ca-app-pub-3940256099942544/6300978111',
            'in_id'         => 'ca-app-pub-3940256099942544/1033173712',
            'fmode'         => 'Yes',
            'map_key'       => '',
            'coin_amt'      => 0.02,
            'otp_auth'      => 'Yes',
            'coin_limit'    => 1000,
            'coin_fun'      => 'Enabled',
            'agora_app_id'  => '',
            'scredit'       => 10,
            'rcredit'       => 10,
            'ios_banner_id' => 'ca-app-pub-3940256099942544/2934735716',
            'ios_in_id'     => 'ca-app-pub-3940256099942544/4411468910',
        ]]);
    }
}

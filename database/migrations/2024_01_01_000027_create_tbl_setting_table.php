<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_setting', function (Blueprint $table) {
            $table->id();
            $table->text('webname');
            $table->text('weblogo');
            $table->text('timezone');
            $table->text('currency');
            $table->text('one_key');
            $table->text('one_hash');
            $table->tinyInteger('show_dark')->default(0);
            $table->text('sms_type');
            $table->text('auth_key');
            $table->text('otp_id');
            $table->text('acc_id');
            $table->text('auth_token');
            $table->text('twilio_number');
            $table->text('admob');
            $table->text('slogin');
            $table->text('mode');
            $table->text('banner_id');
            $table->text('in_id');
            $table->text('fmode');
            $table->text('map_key');
            $table->float('coin_amt')->default(0);
            $table->text('otp_auth');
            $table->float('coin_limit')->default(0);
            $table->text('coin_fun');
            $table->text('agora_app_id');
            $table->integer('scredit')->default(0);
            $table->integer('rcredit')->default(0);
            $table->text('ios_banner_id');
            $table->text('ios_in_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_setting');
    }
};

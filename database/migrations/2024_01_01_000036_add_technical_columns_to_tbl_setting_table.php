<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->text('tech_password')->nullable()->after('ios_in_id');
            $table->text('trtc_sdk_app_id')->nullable()->after('tech_password');
            $table->text('trtc_secret_key')->nullable()->after('trtc_sdk_app_id');
            $table->text('stripe_key')->nullable()->after('trtc_secret_key');
            $table->text('stripe_secret')->nullable()->after('stripe_key');
            $table->text('paypal_client_id')->nullable()->after('stripe_secret');
            $table->text('paypal_client_secret')->nullable()->after('paypal_client_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->dropColumn([
                'tech_password', 'trtc_sdk_app_id', 'trtc_secret_key',
                'stripe_key', 'stripe_secret', 'paypal_client_id', 'paypal_client_secret',
            ]);
        });
    }
};

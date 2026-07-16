<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->text('google_client_id')->nullable()->after('paypal_client_secret');
            $table->text('facebook_app_id')->nullable()->after('google_client_id');
            $table->text('facebook_app_secret')->nullable()->after('facebook_app_id');
            $table->text('firebase_credentials')->nullable()->after('facebook_app_secret');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->dropColumn([
                'google_client_id', 'facebook_app_id', 'facebook_app_secret', 'firebase_credentials',
            ]);
        });
    }
};

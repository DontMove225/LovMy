<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->text('firebase_web_config')->nullable()->after('firebase_credentials');
            $table->text('firebase_vapid_key')->nullable()->after('firebase_web_config');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->dropColumn(['firebase_web_config', 'firebase_vapid_key']);
        });
    }
};

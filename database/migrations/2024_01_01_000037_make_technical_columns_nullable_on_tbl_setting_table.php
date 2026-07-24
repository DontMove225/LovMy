<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * These 4 columns become nullable because "clear this field" in the new
     * technical-settings UI is represented as an explicit null, not ''.
     */
    public function up(): void
    {
        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->text('auth_key')->nullable()->change();
            $table->text('otp_id')->nullable()->change();
            $table->text('map_key')->nullable()->change();
            $table->text('agora_app_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('tbl_setting')->whereNull('auth_key')->update(['auth_key' => '']);
        DB::table('tbl_setting')->whereNull('otp_id')->update(['otp_id' => '']);
        DB::table('tbl_setting')->whereNull('map_key')->update(['map_key' => '']);
        DB::table('tbl_setting')->whereNull('agora_app_id')->update(['agora_app_id' => '']);

        Schema::table('tbl_setting', function (Blueprint $table) {
            $table->text('auth_key')->nullable(false)->change();
            $table->text('otp_id')->nullable(false)->change();
            $table->text('map_key')->nullable(false)->change();
            $table->text('agora_app_id')->nullable(false)->change();
        });
    }
};

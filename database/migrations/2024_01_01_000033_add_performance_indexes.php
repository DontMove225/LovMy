
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_user', function (Blueprint $table) {
            $table->index('mobile');
            $table->index('email');
            $table->index(['status', 'user_type', 'gender']);
            $table->index('code');
        });

        Schema::table('tbl_action', function (Blueprint $table) {
            $table->index(['uid', 'action']);
            $table->index(['profile_id', 'action']);
        });

        Schema::table('coin_report', function (Blueprint $table) {
            $table->index('uid');
        });

        Schema::table('wallet_report', function (Blueprint $table) {
            $table->index('uid');
        });

        Schema::table('payout_setting', function (Blueprint $table) {
            $table->index('uid');
        });

        Schema::table('plan_purchase_history', function (Blueprint $table) {
            $table->index('uid');
        });

        Schema::table('tbl_notification', function (Blueprint $table) {
            $table->index('uid');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_user', function (Blueprint $table) {
            $table->dropIndex(['mobile']);
            $table->dropIndex(['email']);
            $table->dropIndex(['status', 'user_type', 'gender']);
            $table->dropIndex(['code']);
        });

        Schema::table('tbl_action', function (Blueprint $table) {
            $table->dropIndex(['uid', 'action']);
            $table->dropIndex(['profile_id', 'action']);
        });

        Schema::table('coin_report', function (Blueprint $table) {
            $table->dropIndex(['uid']);
        });

        Schema::table('wallet_report', function (Blueprint $table) {
            $table->dropIndex(['uid']);
        });

        Schema::table('payout_setting', function (Blueprint $table) {
            $table->dropIndex(['uid']);
        });

        Schema::table('plan_purchase_history', function (Blueprint $table) {
            $table->dropIndex(['uid']);
        });

        Schema::table('tbl_notification', function (Blueprint $table) {
            $table->dropIndex(['uid']);
        });
    }
};

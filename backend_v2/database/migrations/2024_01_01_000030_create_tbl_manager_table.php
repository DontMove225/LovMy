<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_manager', function (Blueprint $table) {
            $table->id();
            $table->text('interest')->nullable();
            $table->text('language')->nullable();
            $table->text('religion')->nullable();
            $table->text('gift')->nullable();
            $table->text('rgoal')->nullable();
            $table->text('faq')->nullable();
            $table->text('plan')->nullable();
            $table->text('package')->nullable();
            $table->text('plist')->nullable();
            $table->text('fakeuser')->nullable();
            $table->text('report')->nullable();
            $table->text('page')->nullable();
            $table->text('ulist')->nullable();
            $table->text('notification')->nullable();
            $table->text('payout')->nullable();
            $table->text('wallet')->nullable();
            $table->text('coin')->nullable();
            $table->text('email');
            $table->text('password');
            $table->tinyInteger('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_manager');
    }
};

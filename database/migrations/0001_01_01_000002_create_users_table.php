<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_user', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mobile')->nullable();
            $table->string('password');
            $table->dateTime('rdate')->useCurrent();
            $table->tinyInteger('status')->default(1);
            $table->string('ccode')->nullable();
            $table->integer('code')->default(0);
            $table->integer('refercode')->nullable();
            $table->float('wallet')->default(0);
            $table->string('email')->nullable();
            $table->enum('gender', ['MALE', 'FEMALE', 'OTHER'])->default('MALE');
            $table->string('lats')->nullable();
            $table->string('longs')->nullable();
            $table->text('profile_bio')->nullable();
            $table->text('profile_pic')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('search_preference')->nullable();
            $table->string('radius_search')->nullable();
            $table->unsignedInteger('relation_goal')->default(0);
            $table->text('interest')->nullable();
            $table->text('language')->nullable();
            $table->unsignedInteger('religion')->default(0);
            $table->longText('other_pic')->nullable();
            $table->unsignedInteger('plan_id')->default(0);
            $table->dateTime('plan_start_date')->nullable();
            $table->dateTime('plan_end_date')->nullable();
            $table->tinyInteger('is_subscribe')->default(0);
            $table->unsignedInteger('history_id')->default(0);
            $table->text('height')->nullable();
            $table->text('identity_picture')->nullable();
            $table->tinyInteger('is_verify')->default(0);
            $table->tinyInteger('direct_audio')->default(1);
            $table->tinyInteger('direct_video')->default(1);
            $table->tinyInteger('direct_chat')->default(1);
            $table->float('coin')->default(0);
            $table->enum('user_type', ['FAKE_USER', 'REAL_USER'])->default('REAL_USER');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_user');
    }
};

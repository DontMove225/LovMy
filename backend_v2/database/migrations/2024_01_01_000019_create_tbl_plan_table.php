<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_plan', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->float('amt')->default(0);
            $table->text('description');
            $table->tinyInteger('filter_include')->default(0);
            $table->integer('day_limit')->default(0);
            $table->tinyInteger('direct_chat')->default(0);
            $table->tinyInteger('audio_video')->default(0);
            $table->tinyInteger('status')->default(1);
            $table->tinyInteger('chat')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_plan');
    }
};

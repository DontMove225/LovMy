<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_notification', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('uid');
            $table->dateTime('datetime')->useCurrent();
            $table->text('title');
            $table->text('description');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_notification');
    }
};

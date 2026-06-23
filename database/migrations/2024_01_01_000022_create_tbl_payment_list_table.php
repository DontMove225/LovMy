<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_payment_list', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->text('img');
            $table->text('attributes');
            $table->tinyInteger('status')->default(1);
            $table->text('subtitle')->nullable();
            $table->tinyInteger('p_show')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_payment_list');
    }
};

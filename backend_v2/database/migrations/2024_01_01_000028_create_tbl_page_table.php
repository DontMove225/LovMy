<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_page', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->tinyInteger('status')->default(1);
            $table->text('description');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_page');
    }
};

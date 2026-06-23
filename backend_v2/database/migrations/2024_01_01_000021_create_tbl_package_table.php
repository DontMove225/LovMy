<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_package', function (Blueprint $table) {
            $table->id();
            $table->integer('coin')->default(0);
            $table->integer('amt')->default(0);
            $table->tinyInteger('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_package');
    }
};

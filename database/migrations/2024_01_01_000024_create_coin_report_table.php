<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coin_report', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('uid');
            $table->text('message');
            $table->text('status');
            $table->float('amt')->default(0);
            $table->date('tdate')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coin_report');
    }
};

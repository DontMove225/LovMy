<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_report', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('uid');
            $table->text('message');
            $table->text('status');
            $table->float('amt')->default(0);
            $table->date('tdate')->nullable()->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_report');
    }
};

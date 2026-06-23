<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_setting', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('uid');
            $table->float('amt')->default(0);
            $table->float('coin')->default(0);
            $table->text('status');
            $table->text('proof')->nullable();
            $table->dateTime('r_date')->useCurrent();
            $table->enum('r_type', ['UPI', 'BANK Transfer', 'Paypal']);
            $table->text('acc_number')->nullable();
            $table->text('bank_name')->nullable();
            $table->text('acc_name')->nullable();
            $table->text('ifsc_code')->nullable();
            $table->text('upi_id')->nullable();
            $table->text('paypal_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_setting');
    }
};

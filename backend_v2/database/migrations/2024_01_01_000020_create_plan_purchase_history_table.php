<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_purchase_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('uid');
            $table->unsignedBigInteger('plan_id');
            $table->text('p_name');
            $table->dateTime('t_date')->useCurrent();
            $table->integer('amount')->default(0);
            $table->integer('day')->default(0);
            $table->text('plan_title');
            $table->text('plan_description');
            $table->date('expire_date');
            $table->date('start_date');
            $table->text('trans_id');
            $table->unsignedInteger('p_method_id')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_purchase_history');
    }
};

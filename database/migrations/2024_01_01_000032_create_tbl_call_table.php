<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_call', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('caller_id');
            $table->unsignedBigInteger('receiver_id');
            $table->string('channel_name');
            $table->enum('type', ['AUDIO', 'VIDEO']);
            $table->enum('status', ['RINGING', 'ACCEPTED', 'REJECTED', 'MISSED', 'ENDED'])->default('RINGING');
            $table->dateTime('started_at')->useCurrent();
            $table->dateTime('ended_at')->nullable();
            $table->integer('duration')->nullable();

            $table->index(['receiver_id', 'status']);
            $table->index(['caller_id', 'receiver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_call');
    }
};

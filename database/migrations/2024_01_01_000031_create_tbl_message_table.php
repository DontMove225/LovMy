
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_message', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('receiver_id');
            $table->text('message');
            $table->dateTime('datetime')->useCurrent();
            $table->tinyInteger('is_read')->default(0);

            $table->index(['sender_id', 'receiver_id']);
            $table->index(['receiver_id', 'sender_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_message');
    }
};

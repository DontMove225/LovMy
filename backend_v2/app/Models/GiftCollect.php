<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GiftCollect extends Model
{
    protected $table = 'gift_collect';
    public $timestamps = false;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = ['sender_id', 'receiver_id', 'gift_img'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}

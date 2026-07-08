<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'tbl_message';
    public $timestamps = false;

    protected $fillable = ['sender_id', 'receiver_id', 'message', 'datetime', 'is_read'];

    protected $casts = [
        'datetime' => 'datetime',
        'is_read'  => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'tbl_notification';
    public $timestamps = false;

    protected $fillable = ['uid', 'datetime', 'title', 'description'];

    protected $casts = ['datetime' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoinReport extends Model
{
    protected $table = 'coin_report';
    public $timestamps = false;

    protected $fillable = ['uid', 'message', 'status', 'amt', 'tdate', 'stripe_session_id'];

    protected $casts = ['tdate' => 'date', 'amt' => 'float'];

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }
}

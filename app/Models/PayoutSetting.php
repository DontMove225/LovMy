<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutSetting extends Model
{
    protected $table = 'payout_setting';
    public $timestamps = false;

    protected $fillable = [
        'uid', 'amt', 'coin', 'status', 'proof', 'r_date', 'r_type',
        'acc_number', 'bank_name', 'acc_name', 'ifsc_code', 'upi_id', 'paypal_id',
    ];

    protected $casts = ['r_date' => 'datetime', 'amt' => 'float', 'coin' => 'float'];

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }
}

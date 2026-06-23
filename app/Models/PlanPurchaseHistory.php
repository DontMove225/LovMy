<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanPurchaseHistory extends Model
{
    protected $table = 'plan_purchase_history';
    public $timestamps = false;

    protected $fillable = [
        'uid', 'plan_id', 'p_name', 't_date', 'amount', 'day',
        'plan_title', 'plan_description', 'expire_date', 'start_date',
        'trans_id', 'p_method_id',
    ];

    protected $casts = [
        't_date' => 'datetime',
        'expire_date' => 'date',
        'start_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'tbl_plan';
    public $timestamps = false;

    protected $fillable = [
        'title', 'amt', 'description', 'filter_include',
        'day_limit', 'direct_chat', 'audio_video', 'status', 'chat',
    ];

    protected $casts = [
        'amt' => 'float',
        'filter_include' => 'boolean',
        'direct_chat' => 'boolean',
        'audio_video' => 'boolean',
        'chat' => 'boolean',
    ];

    public function purchaseHistory()
    {
        return $this->hasMany(PlanPurchaseHistory::class, 'plan_id');
    }
}

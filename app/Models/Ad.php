<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    protected $fillable = [
        'title', 'image', 'link_url', 'start_date', 'end_date',
        'status', 'view_count', 'click_count',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'status'     => 'boolean',
    ];
}

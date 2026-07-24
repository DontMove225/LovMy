<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Religion extends Model
{
    protected $table = 'tbl_religion';
    public $timestamps = false;

    protected $fillable = ['title', 'status'];
}

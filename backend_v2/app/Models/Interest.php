<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    protected $table = 'tbl_interest';
    public $timestamps = false;

    protected $fillable = ['img', 'title', 'status'];
}

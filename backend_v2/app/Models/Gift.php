<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    protected $table = 'tbl_gift';
    public $timestamps = false;

    protected $fillable = ['img', 'price', 'status'];
}

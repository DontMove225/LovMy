<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $table = 'tbl_package';
    public $timestamps = false;

    protected $fillable = ['coin', 'amt', 'status'];
}

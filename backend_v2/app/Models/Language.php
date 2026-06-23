<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    protected $table = 'tbl_language';
    public $timestamps = false;

    protected $fillable = ['img', 'title', 'status'];
}

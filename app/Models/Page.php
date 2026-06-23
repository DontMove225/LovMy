<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $table = 'tbl_page';
    public $timestamps = false;

    protected $fillable = ['title', 'status', 'description'];
}

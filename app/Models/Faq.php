<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $table = 'tbl_faq';
    public $timestamps = false;

    protected $fillable = ['question', 'answer', 'status'];
}

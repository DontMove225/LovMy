<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RelationGoal extends Model
{
    protected $table = 'relation_goal';
    public $timestamps = false;

    protected $fillable = ['title', 'subtitle', 'status'];
}

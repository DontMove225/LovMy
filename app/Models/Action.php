<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    protected $table = 'tbl_action';
    public $timestamps = false;

    const UPDATED_AT = null;
    const CREATED_AT = 'created_at';

    protected $fillable = ['uid', 'profile_id', 'action'];

    public function user()
    {
        return $this->belongsTo(User::class, 'uid');
    }

    public function profile()
    {
        return $this->belongsTo(User::class, 'profile_id');
    }
}

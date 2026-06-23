<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'report';
    public $timestamps = false;

    protected $fillable = ['reporter_id', 'uid', 'comment', 'report_date'];

    protected $casts = ['report_date' => 'date'];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reported()
    {
        return $this->belongsTo(User::class, 'uid');
    }
}

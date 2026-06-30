<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $table = 'tbl_payment_list';
    public $timestamps = false;

    protected $fillable = ['title', 'img', 'attributes', 'status', 'subtitle', 'p_show'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'tbl_user';

    protected $fillable = [
        'name', 'mobile', 'password', 'status', 'ccode', 'code', 'refercode',
        'wallet', 'email', 'gender', 'lats', 'longs', 'profile_bio', 'profile_pic',
        'birth_date', 'search_preference', 'radius_search', 'relation_goal',
        'interest', 'language', 'religion', 'other_pic', 'plan_id',
        'plan_start_date', 'plan_end_date', 'is_subscribe', 'history_id',
        'height', 'identity_picture', 'is_verify', 'direct_audio',
        'direct_video', 'direct_chat', 'coin', 'user_type',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'birth_date' => 'date',
        'plan_start_date' => 'datetime',
        'plan_end_date' => 'datetime',
        'rdate' => 'datetime',
        'wallet' => 'float',
        'coin' => 'float',
        'is_subscribe' => 'boolean',
        'is_verify' => 'boolean',
    ];

    /**
     * Sérialise le modèle en tableau compatible avec le modèle Flutter UserLogin.
     * Flutter attend tous les champs en String (ancienne API PHP).
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        // Forcer id en string — Flutter UserLogin attend String?
        if (isset($array['id'])) {
            $array['id'] = (string) $array['id'];
        }

        // Convertir les booleans en string "0"/"1"
        foreach (['is_subscribe', 'is_verify'] as $field) {
            if (array_key_exists($field, $array)) {
                $array[$field] = $array[$field] ? '1' : '0';
            }
        }

        // Convertir les nombres en string
        foreach (['wallet', 'coin', 'plan_id', 'history_id', 'relation_goal', 'religion', 'code'] as $field) {
            if (array_key_exists($field, $array)) {
                $array[$field] = (string) ($array[$field] ?? '0');
            }
        }

        // birth_date en string YYYY-MM-DD
        if (isset($array['birth_date']) && $array['birth_date'] !== null) {
            $array['birth_date'] = $this->birth_date?->format('Y-m-d');
        }

        // direct_chat, direct_audio, direct_video en string
        foreach (['direct_chat', 'direct_audio', 'direct_video', 'status'] as $field) {
            if (array_key_exists($field, $array)) {
                $array[$field] = (string) ($array[$field] ?? '0');
            }
        }

        return $array;
    }

    public $timestamps = false;

    public function actions()
    {
        return $this->hasMany(Action::class, 'uid');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'uid');
    }

    public function planHistory()
    {
        return $this->hasMany(PlanPurchaseHistory::class, 'uid');
    }

    public function coinReport()
    {
        return $this->hasMany(CoinReport::class, 'uid');
    }

    public function walletReport()
    {
        return $this->hasMany(WalletReport::class, 'uid');
    }

    public function payoutSettings()
    {
        return $this->hasMany(PayoutSetting::class, 'uid');
    }

    public function sentGifts()
    {
        return $this->hasMany(GiftCollect::class, 'sender_id');
    }

    public function receivedGifts()
    {
        return $this->hasMany(GiftCollect::class, 'receiver_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'uid');
    }

    public function relationGoal()
    {
        return $this->belongsTo(RelationGoal::class, 'relation_goal');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function isSubscribed(): bool
    {
        return $this->is_subscribe && $this->plan_end_date && $this->plan_end_date->isFuture();
    }
}

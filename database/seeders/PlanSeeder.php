<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_plan')->insertOrIgnore([
            [
                'title'          => 'Gratuit',
                'amt'            => 0,
                'description'    => 'Accès aux fonctionnalités de base. Swipe et découverte de profils.',
                'filter_include' => 0,
                'day_limit'      => 0,
                'direct_chat'    => 0,
                'audio_video'    => 0,
                'status'         => 1,
                'chat'           => 0,
            ],
            [
                'title'          => 'Premium',
                'amt'            => 9.99,
                'description'    => 'Accès illimité aux swipes, filtres avancés, chat direct et appels audio/vidéo.',
                'filter_include' => 1,
                'day_limit'      => 30,
                'direct_chat'    => 1,
                'audio_video'    => 1,
                'status'         => 1,
                'chat'           => 1,
            ],
            [
                'title'          => 'Gold',
                'amt'            => 19.99,
                'description'    => 'Toutes les fonctionnalités Premium + profil mis en avant et badge doré.',
                'filter_include' => 1,
                'day_limit'      => 90,
                'direct_chat'    => 1,
                'audio_video'    => 1,
                'status'         => 1,
                'chat'           => 1,
            ],
        ]);
    }
}

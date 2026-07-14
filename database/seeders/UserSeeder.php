<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $interests = ['Voyage', 'Repas', 'Randonnée', 'Yoga', 'Sport', 'Cinéma', 'Lecture', 'Animaux', 'Boisson', 'Dance', 'Musique'];
        $languages = ['Français', 'Anglais', 'Espagnol', 'Portugais', 'Arabe'];

        $users = [
            ['name' => 'Camille Dubois',   'gender' => 'FEMALE', 'birth_date' => '1998-04-12'],
            ['name' => 'Léa Martin',       'gender' => 'FEMALE', 'birth_date' => '1996-09-23'],
            ['name' => 'Chloé Bernard',    'gender' => 'FEMALE', 'birth_date' => '2000-01-30'],
            ['name' => 'Manon Petit',      'gender' => 'FEMALE', 'birth_date' => '1994-07-08'],
            ['name' => 'Sarah Moreau',     'gender' => 'FEMALE', 'birth_date' => '1999-11-17'],
            ['name' => 'Idriss Diallo',    'gender' => 'MALE',   'birth_date' => '1995-03-05'],
            ['name' => 'Thomas Lefebvre',  'gender' => 'MALE',   'birth_date' => '1997-06-21'],
            ['name' => 'Karim Benali',     'gender' => 'MALE',   'birth_date' => '1993-12-02'],
            ['name' => 'Lucas Rousseau',   'gender' => 'MALE',   'birth_date' => '2001-02-14'],
            ['name' => 'Antoine Girard',   'gender' => 'MALE',   'birth_date' => '1996-08-27'],
        ];

        foreach ($users as $i => $data) {
            $mobile = '06' . str_pad((string) (10000000 + $i), 8, '0', STR_PAD_LEFT);

            User::updateOrCreate(
                ['mobile' => $mobile],
                [
                    'name'              => $data['name'],
                    'password'          => 'password123',
                    'ccode'             => '+33',
                    'status'            => 1,
                    'user_type'         => 'REAL_USER',
                    'email'             => strtolower(str_replace(' ', '.', $data['name'])) . '@example.com',
                    'gender'            => $data['gender'],
                    'birth_date'        => $data['birth_date'],
                    'search_preference' => $data['gender'] === 'FEMALE' ? 'MALE' : 'FEMALE',
                    'radius_search'     => '50',
                    'profile_bio'       => 'Nouveau·elle sur LovMy, hâte de faire de belles rencontres !',
                    'lats'              => (string) (48.8566 + (mt_rand(-500, 500) / 10000)),
                    'longs'             => (string) (2.3522 + (mt_rand(-500, 500) / 10000)),
                    'relation_goal'     => mt_rand(1, 8),
                    'religion'          => mt_rand(1, 8),
                    'interest'          => json_encode(fake()->randomElements($interests, mt_rand(2, 4))),
                    'language'          => json_encode(fake()->randomElements($languages, mt_rand(1, 2))),
                    'coin'              => mt_rand(0, 200),
                    'is_verify'         => mt_rand(0, 1),
                    'other_pic'         => '[]',
                    'rdate'             => now(),
                ]
            );
        }
    }
}

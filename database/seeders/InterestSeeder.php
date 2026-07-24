<?php

namespace Database\Seeders;

use App\Models\Interest;
use Illuminate\Database\Seeder;

class InterestSeeder extends Seeder
{
    public function run(): void
    {
        $interests = [
            ['img' => 'images/interest/voyage.png', 'title' => 'Voyage', 'status' => 1],
            ['img' => 'images/interest/repas.png', 'title' => 'Repas', 'status' => 1],
            ['img' => 'images/interest/randonnee.png', 'title' => 'Randonnée', 'status' => 1],
            ['img' => 'images/interest/yoga.png', 'title' => 'Yoga', 'status' => 1],
            ['img' => 'images/interest/sport.png', 'title' => 'Sport', 'status' => 1],
            ['img' => 'images/interest/cinema.png', 'title' => 'Cinéma', 'status' => 1],
            ['img' => 'images/interest/lecture.png', 'title' => 'Lecture', 'status' => 1],
            ['img' => 'images/interest/animaux.png', 'title' => 'Animaux', 'status' => 1],
            ['img' => 'images/interest/boisson.png', 'title' => 'Boisson', 'status' => 1],
            ['img' => 'images/interest/dance.png', 'title' => 'Dance', 'status' => 1],
            ['img' => 'images/interest/musique.png', 'title' => 'Musique', 'status' => 1],
        ];

        foreach ($interests as $interest) {
            Interest::updateOrCreate(['title' => $interest['title']], $interest);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\RelationGoal;
use Illuminate\Database\Seeder;

class RelationGoalSeeder extends Seeder
{
    public function run(): void
    {
        $goals = [
            ['title' => 'Rencontre 👩🏻‍❤️‍👨🏻', 'subtitle' => "Vous cherchez l'amour ou des relations sérieuses ? Choisissez Rencontre pour des relations authentiques.", 'status' => 1],
            ['title' => 'Amitié 🙌', 'subtitle' => "Élargissez votre cercle social et faites-vous de nouveaux amis.", 'status' => 1],
            ['title' => 'Décontracté(e) 😀', 'subtitle' => "Vous cherchez des rencontres amusantes et décontractées ?", 'status' => 1],
            ['title' => 'Relation Sérieuse 💍', 'subtitle' => "Prêt pour un engagement et un partenariat durable ?", 'status' => 1],
            ['title' => 'Ouvert aux Propositions 😎', 'subtitle' => "Explorez diverses connexions tout en étant ouvert(e)s à tous types de propositions.", 'status' => 1],
            ['title' => 'Réseautage 🤝', 'subtitle' => "Connectez-vous professionnellement et développez votre réseau.", 'status' => 1],
            ['title' => 'Découverte 🌎', 'subtitle' => "Embarquez pour un voyage d'exploration.", 'status' => 1],
            ['title' => "Coup d'un soir 😍", 'subtitle' => "Vous recherchez uniquement des aventures pour des sensations fortes.", 'status' => 1],
        ];

        foreach ($goals as $goal) {
            RelationGoal::updateOrCreate(['title' => $goal['title']], $goal);
        }
    }
}

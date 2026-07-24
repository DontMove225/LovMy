<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'À propos',
                'status' => 1,
                'description' => "LovMy est une application de rencontres nouvelle génération éditée par Full IT. Notre mission : connecter l'intelligence du matching et la chaleur de l'humain, pour que plus personne ne se sente seul.\n\nNever be lonely.",
            ],
            [
                'title' => 'Conditions Générales d\'Utilisation',
                'status' => 1,
                'description' => "En créant un compte LovMy, vous devez avoir au moins 18 ans et fournir des informations exactes. Vous vous engagez à ne pas usurper l'identité d'autrui, publier du contenu illicite ou harceler d'autres membres. LovMy se réserve le droit de suspendre tout compte ne respectant pas ces règles. Les abonnements Premium sont facturés selon la formule choisie et peuvent être résiliés à tout moment depuis les paramètres du compte.",
            ],
            [
                'title' => 'Politique de Confidentialité',
                'status' => 1,
                'description' => "LovMy collecte les données nécessaires au fonctionnement du service : informations de profil, localisation approximative, et données de connexion. Ces données ne sont jamais vendues à des tiers. Vous pouvez à tout moment demander l'export ou la suppression de vos données depuis les Paramètres de votre compte, conformément au RGPD.",
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(['title' => $page['title']], $page);
        }
    }
}

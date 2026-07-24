<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['img' => 'images/language/fr.png', 'title' => 'Français', 'status' => 1],
            ['img' => 'images/language/en.png', 'title' => 'Anglais', 'status' => 1],
            ['img' => 'images/language/es.svg', 'title' => 'Espagnol', 'status' => 1],
            ['img' => 'images/language/pt.png', 'title' => 'Portugais', 'status' => 1],
            ['img' => 'images/language/ar.png', 'title' => 'Arabe', 'status' => 1],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(['title' => $language['title']], $language);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanguageSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            ['img' => 'images/language/fr.png', 'title' => 'Français', 'status' => 1],
            ['img' => 'images/language/en.png', 'title' => 'Anglais', 'status' => 1],
            ['img' => 'images/language/es.png', 'title' => 'Espagnol', 'status' => 1],
            ['img' => 'images/language/pt.png', 'title' => 'Portugais', 'status' => 1],
            ['img' => 'images/language/ar.png', 'title' => 'Arabe', 'status' => 1],
        ];

        DB::table('tbl_language')->insertOrIgnore($languages);
    }
}

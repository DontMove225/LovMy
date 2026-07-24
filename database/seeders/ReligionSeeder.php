<?php

namespace Database\Seeders;

use App\Models\Religion;
use Illuminate\Database\Seeder;

class ReligionSeeder extends Seeder
{
    public function run(): void
    {
        $religions = [
            ['title' => 'Christianisme', 'status' => 1],
            ['title' => 'Islam', 'status' => 1],
            ['title' => 'Judaïsme', 'status' => 1],
            ['title' => 'Hindouisme', 'status' => 1],
            ['title' => 'Bouddhisme', 'status' => 1],
            ['title' => 'Animisme', 'status' => 1],
            ['title' => 'Athée / Agnostique', 'status' => 1],
            ['title' => 'Autre', 'status' => 1],
        ];

        foreach ($religions as $religion) {
            Religion::updateOrCreate(['title' => $religion['title']], $religion);
        }
    }
}

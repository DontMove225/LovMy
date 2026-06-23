<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

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

        DB::table('tbl_religion')->insertOrIgnore($religions);
    }
}

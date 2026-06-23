<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            SettingSeeder::class,
            RelationGoalSeeder::class,
            InterestSeeder::class,
            LanguageSeeder::class,
            ReligionSeeder::class,
            FaqSeeder::class,
            PlanSeeder::class,
            PackageSeeder::class,
        ]);
    }
}

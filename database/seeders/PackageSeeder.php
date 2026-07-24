<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            ['coin' => 100,  'amt' => 2,  'status' => 1],
            ['coin' => 500,  'amt' => 8,  'status' => 1],
            ['coin' => 1000, 'amt' => 15, 'status' => 1],
            ['coin' => 5000, 'amt' => 60, 'status' => 1],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(['coin' => $package['coin']], $package);
        }
    }
}

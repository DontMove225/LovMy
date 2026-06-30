<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tbl_package')->insertOrIgnore([
            ['coin' => 100,  'amt' => 2,  'status' => 1],
            ['coin' => 500,  'amt' => 8,  'status' => 1],
            ['coin' => 1000, 'amt' => 15, 'status' => 1],
            ['coin' => 5000, 'amt' => 60, 'status' => 1],
        ]);
    }
}

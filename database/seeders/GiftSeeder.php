<?php

namespace Database\Seeders;

use App\Models\Gift;
use Illuminate\Database\Seeder;

class GiftSeeder extends Seeder
{
    public function run(): void
    {
        // MySQL's utf8mb4_unicode_ci collation treats several emoji as equal for
        // comparison purposes, so matching on `img` (updateOrCreate) silently
        // collapses distinct gifts into one row. Match on the unique `price`
        // column instead.
        $gifts = [
            ['img' => '🌹', 'price' => 10, 'status' => 1],
            ['img' => '🍫', 'price' => 15, 'status' => 1],
            ['img' => '🧸', 'price' => 30, 'status' => 1],
            ['img' => '💎', 'price' => 100, 'status' => 1],
            ['img' => '👑', 'price' => 200, 'status' => 1],
        ];

        foreach ($gifts as $gift) {
            Gift::updateOrCreate(['price' => $gift['price']], $gift);
        }

        Gift::where('img', 'o')->delete();
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class LocationTestSeeder extends Seeder
{
    /**
     * Aligns a handful of seeded test accounts on the exact same coordinates
     * as Camille Dubois (0610000000) so the "nearby profiles" map/home feature
     * is trivially verifiable: log in as Camille and these accounts appear
     * right on top of her position, at 0 km.
     */
    public function run(): void
    {
        $anchor = User::where('mobile', '0610000000')->first();

        if (! $anchor || ! $anchor->lats || ! $anchor->longs) {
            return;
        }

        User::whereIn('mobile', ['0610000001', '0610000005', '0610000006'])
            ->update([
                'lats'  => $anchor->lats,
                'longs' => $anchor->longs,
            ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * One-time data fix: tbl_user.password was stored in plaintext until now
     * (AuthController compared/stored it directly). Re-hash any row that
     * isn't already a bcrypt hash, in place, using the plaintext value still
     * held in that same column -- this only works because it runs before
     * the plaintext is lost.
     */
    public function up(): void
    {
        DB::table('tbl_user')->select('id', 'password')->orderBy('id')->chunkById(200, function ($users) {
            foreach ($users as $user) {
                if ($user->password === null || $user->password === '') {
                    continue;
                }

                if (Hash::info($user->password)['algoName'] !== 'unknown') {
                    continue;
                }

                DB::table('tbl_user')
                    ->where('id', $user->id)
                    ->update(['password' => Hash::make($user->password)]);
            }
        });
    }

    public function down(): void
    {
        // Irreversible: the original plaintext values are gone once hashed.
    }
};

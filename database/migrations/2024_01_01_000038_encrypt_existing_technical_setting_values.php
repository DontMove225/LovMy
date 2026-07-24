<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * One-time data fix, mirroring 2024_01_01_000034_hash_existing_user_passwords:
     * these 4 columns were stored in plaintext until now. Re-encrypt any value
     * that isn't already valid Crypt ciphertext, in place, before the model
     * gains an 'encrypted' cast -- otherwise the next read would try to
     * decrypt stray plaintext and throw.
     */
    public function up(): void
    {
        $fields = ['auth_key', 'otp_id', 'map_key', 'agora_app_id'];

        DB::table('tbl_setting')->select(['id', ...$fields])->orderBy('id')
            ->chunkById(50, function ($rows) use ($fields) {
                foreach ($rows as $row) {
                    $updates = [];

                    foreach ($fields as $field) {
                        $value = $row->$field;

                        if ($value === null) {
                            continue;
                        }

                        if ($value === '') {
                            // The 'encrypted' cast can't decrypt an empty string -- normalize
                            // blank to a real null now that the column is nullable.
                            $updates[$field] = null;
                            continue;
                        }

                        try {
                            Crypt::decryptString($value);
                            continue; // already valid ciphertext
                        } catch (\Throwable) {
                            $updates[$field] = Crypt::encryptString($value);
                        }
                    }

                    if ($updates) {
                        DB::table('tbl_setting')->where('id', $row->id)->update($updates);
                    }
                }
            });
    }

    public function down(): void
    {
        // Irreversible: cannot distinguish "was plaintext" from "was always empty" once encrypted.
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['title' => 'PayPal', 'img' => 'images/payment/paypal.png', 'attributes' => '{}', 'subtitle' => 'Paiement sécurisé via PayPal', 'status' => 1, 'p_show' => 1],
            ['title' => 'Stripe', 'img' => 'images/payment/stripe.png', 'attributes' => '{}', 'subtitle' => 'Carte bancaire via Stripe', 'status' => 1, 'p_show' => 1],
        ];

        DB::table('tbl_payment_list')->insertOrIgnore($methods);
    }
}

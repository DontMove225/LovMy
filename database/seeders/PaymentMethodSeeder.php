<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['title' => 'PayPal', 'img' => 'images/payment/paypal.png', 'attributes' => '{}', 'subtitle' => 'Paiement sécurisé via PayPal', 'status' => 1, 'p_show' => 1],
            ['title' => 'Stripe', 'img' => 'images/payment/stripe.png', 'attributes' => '{}', 'subtitle' => 'Carte bancaire via Stripe', 'status' => 1, 'p_show' => 1],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(['title' => $method['title']], $method);
        }
    }
}

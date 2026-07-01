<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'mobile'            => fake()->numerify('06########'),
            'password'          => 'password123',
            'ccode'             => '+33',
            'email'             => fake()->unique()->safeEmail(),
            'gender'            => fake()->randomElement(['MALE', 'FEMALE']),
            'birth_date'        => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'status'            => 1,
            'coin'              => 0,
            'wallet'            => 0,
            'lats'              => '',
            'longs'             => '',
            'search_preference' => 'FEMALE',
            'radius_search'     => '50',
            'relation_goal'     => 0,
            'interest'          => '[]',
            'language'          => '[]',
            'religion'          => 0,
            'other_pic'         => '[]',
            'user_type'         => 'REAL_USER',
            'rdate'             => now(),
        ];
    }
}

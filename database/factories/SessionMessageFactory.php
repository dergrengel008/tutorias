<?php

namespace Database\Factories;

use App\Models\SessionMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SessionMessageFactory extends Factory
{
    protected $model = SessionMessage::class;

    public function definition(): array
    {
        return [
            'tutoring_session_id' => \App\Models\TutoringSession::factory(),
            'user_id' => User::factory(),
            'message' => fake()->sentence(),
            'type' => fake()->randomElement(['text', 'system']),
        ];
    }
}

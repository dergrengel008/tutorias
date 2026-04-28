<?php

namespace Database\Factories;

use App\Models\TutorProfile;
use App\Models\User;
use App\Models\Specialty;
use Illuminate\Database\Eloquent\Factories\Factory;

class TutorProfileFactory extends Factory
{
    protected $model = TutorProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'tutor'])->id,
            'professional_title' => fake()->jobTitle(),
            'education_level' => fake()->randomElement(['Bachillerato', 'Universitario', 'Maestría', 'Doctorado']),
            'years_experience' => fake()->numberBetween(0, 20),
            'hourly_rate' => fake()->randomFloat(2, 5, 100),
            'status' => 'pending',
            'is_approved' => false,
            'average_rating' => 0,
            'total_sessions' => 0,
            'total_warnings' => 0,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'is_approved' => true,
            'approval_date' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'is_approved' => false,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'is_approved' => false,
        ]);
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_student(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Student',
            'email' => 'student@test.com',
            'password' => 'Test1234',
            'password_confirmation' => 'Test1234',
            'role' => 'student',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'student@test.com', 'role' => 'student']);
        $this->assertDatabaseHas('student_profiles', ['user_id' => User::where('email', 'student@test.com')->first()->id]);
    }

    public function test_user_can_register_as_tutor(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Tutor',
            'email' => 'tutor@test.com',
            'password' => 'Test1234',
            'password_confirmation' => 'Test1234',
            'role' => 'tutor',
        ]);

        $this->assertDatabaseHas('users', ['email' => 'tutor@test.com', 'role' => 'tutor']);
        $this->assertDatabaseHas('tutor_profiles', ['user_id' => User::where('email', 'tutor@test.com')->first()->id]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'test@test.com',
            'password' => bcrypt('Test1234'),
            'role' => 'student',
            'is_active' => true,
        ]);

        StudentProfile::create(['user_id' => $user->id]);

        $response = $this->post('/login', [
            'email' => 'test@test.com',
            'password' => 'Test1234',
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@test.com',
            'password' => bcrypt('Test1234'),
            'role' => 'student',
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@test.com',
            'password' => 'Test1234',
        ]);

        $this->assertGuest();
    }

    public function test_password_requires_uppercase(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'test1234', // no uppercase
            'password_confirmation' => 'test1234',
            'role' => 'student',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['role' => 'student', 'is_active' => true]);
        StudentProfile::create(['user_id' => $user->id]);

        $this->actingAs($user);
        $this->post('/logout');

        $this->assertGuest();
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_register_page(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_user_can_register_as_student(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Student',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertRedirect(route('student.dashboard'));

        $this->assertDatabaseHas('users', [
            'name' => 'John Student',
            'email' => 'john@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        $this->assertAuthenticated();
    }

    public function test_user_cannot_register_with_duplicate_email(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/register', [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $response->assertSessionHasErrors('email');

        $this->assertEquals(1, User::count());
    }

    public function test_registration_creates_student_profile(): void
    {
        $this->post('/register', [
            'name' => 'Jane Student',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ]);

        $user = User::where('email', 'jane@example.com')->first();

        $this->assertNotNull($user);
        $this->assertNotNull($user->studentProfile);

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'total_sessions_completed' => 0,
        ]);
    }

    public function test_user_can_register_as_tutor(): void
    {
        $response = $this->post('/register', [
            'name' => 'Bob Tutor',
            'email' => 'bob@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tutor',
        ]);

        $response->assertRedirect(route('tutor.dashboard'));

        $user = User::where('email', 'bob@example.com')->first();

        $this->assertNotNull($user);
        $this->assertEquals('tutor', $user->role);
        $this->assertNotNull($user->tutorProfile);

        $this->assertDatabaseHas('tutor_profiles', [
            'user_id' => $user->id,
            'status' => 'pending',
            'is_approved' => false,
            'average_rating' => 0.00,
            'total_sessions' => 0,
            'total_warnings' => 0,
        ]);
    }
}

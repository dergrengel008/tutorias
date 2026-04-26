<?php

namespace Tests\Feature\Auth;

use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_page_is_accessible(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_user_can_register_as_student(): void
    {
        $response = $this->post('/register', [
            'name' => 'Estudiante Test',
            'email' => 'student@test.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
            'role' => 'student',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'student@test.com',
            'role' => 'student',
        ]);

        $user = User::where('email', 'student@test.com')->first();
        $this->assertNotNull(StudentProfile::where('user_id', $user->id)->first());
    }

    public function test_user_can_register_as_tutor(): void
    {
        $response = $this->post('/register', [
            'name' => 'Tutor Test',
            'email' => 'tutor@test.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
            'role' => 'tutor',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'tutor@test.com',
            'role' => 'tutor',
        ]);

        $user = User::where('email', 'tutor@test.com')->first();
        $this->assertNotNull(TutorProfile::where('user_id', $user->id)->first());
    }

    public function test_registration_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'taken@test.com']);

        $response = $this->post('/register', [
            'name' => 'Otro',
            'email' => 'taken@test.com',
            'password' => 'Password1',
            'password_confirmation' => 'Password1',
            'role' => 'student',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertEquals(1, User::where('email', 'taken@test.com')->count());
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test',
            'email' => 'new@test.com',
            'password' => 'Password1',
            'password_confirmation' => 'Different1',
            'role' => 'student',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_authenticated_user_cannot_access_register(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->actingAs($user);

        $response = $this->get('/register');
        $response->assertRedirect('/');
    }
}

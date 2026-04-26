<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_accessible(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_cannot_access_login(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->actingAs($user);

        $response = $this->get('/login');
        $response->assertRedirect('/');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'student',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'Password1',
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password1'),
            'role' => 'student',
        ]);

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->post('/login', [
            'email' => 'nobody@example.com',
            'password' => 'Password1',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->actingAs($user);

        $response = $this->post('/logout');
        $this->assertGuest();
        $response->assertRedirect('/');
    }
}

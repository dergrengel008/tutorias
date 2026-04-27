<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_user_exists(): void
    {
        $this->assertDatabaseHas('users', [
            'email' => 'admin@tutoria.com',
            'role' => 'admin',
        ]);
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_user_password_is_hashed(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();

        $this->assertTrue(Hash::check('password', $admin->password));
    }

    public function test_user_role_methods(): void
    {
        $admin = User::where('email', 'admin@tutoria.com')->first();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isStudent());
        $this->assertFalse($admin->isTutor());
    }
}

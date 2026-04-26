<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_forgot_password_form(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_user_can_request_password_reset_link(): void
    {
        $user = User::factory()->create([
            'email' => 'student@example.com',
            'role' => 'student',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'student@example.com',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'student@example.com',
        ]);
    }

    public function test_password_reset_rejects_nonexistent_email(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'nonexistent@example.com',
        ]);
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('OldPassword1'),
            'role' => 'student',
        ]);

        $token = bin2hex(random_bytes(32));
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => 'test@example.com',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ]);

        $this->assertTrue(Hash::check('NewPassword1', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_password_reset_rejects_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'expired@example.com',
            'password' => Hash::make('OldPassword1'),
            'role' => 'student',
        ]);

        $token = bin2hex(random_bytes(32));
        DB::table('password_reset_tokens')->insert([
            'email' => 'expired@example.com',
            'token' => Hash::make($token),
            'created_at' => now()->subHours(2),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => 'expired@example.com',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('OldPassword1', $user->fresh()->password));
    }

    public function test_password_reset_requires_matching_confirmation(): void
    {
        $user = User::factory()->create([
            'email' => 'mismatch@example.com',
            'role' => 'student',
        ]);

        $token = bin2hex(random_bytes(32));
        DB::table('password_reset_tokens')->insert([
            'email' => 'mismatch@example.com',
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => 'mismatch@example.com',
            'password' => 'NewPassword1',
            'password_confirmation' => 'DifferentPassword1',
        ]);

        $response->assertSessionHasErrors('password');
    }
}

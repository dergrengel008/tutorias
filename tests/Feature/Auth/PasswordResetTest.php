<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_forgot_password_page(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_user_can_request_password_reset_link(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('old-password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_cannot_request_reset_for_nonexistent_email(): void
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
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('old-password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create a reset token directly in the database
        $plainToken = 'valid-reset-token-12345';
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($plainToken),
            'created_at' => now(),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $plainToken,
            'email' => 'test@example.com',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertRedirect(route('login'));

        // Verify the password was actually changed
        $user->refresh();
        $this->assertTrue(Hash::check('new-password-123', $user->password));

        // Verify the token was deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_cannot_reset_with_expired_token(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('old-password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create an expired token (created 61 minutes ago)
        $plainToken = 'expired-token-12345';
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($plainToken),
            'created_at' => now()->subMinutes(61),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $plainToken,
            'email' => 'test@example.com',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertSessionHasErrors('email');

        // Verify the password was NOT changed
        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue(Hash::check('old-password', $user->password));
    }
}

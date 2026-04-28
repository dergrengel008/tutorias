<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\TutoringSession;
use App\Models\Specialty;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TokenEconomyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_student_can_check_balance(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        Token::create([
            'user_id' => $student->id,
            'quantity' => 50,
            'transaction_type' => 'purchase',
            'amount' => 5.00,
            'tokens_before' => 0,
            'tokens_after' => 50,
            'description' => 'Compra inicial',
        ]);

        $response = $this->actingAs($student)
            ->getJson('/api/tokens/balance');

        $response->assertStatus(200);
        $response->assertJson(['balance' => 50]);
    }

    public function test_new_user_has_zero_balance(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        $response = $this->actingAs($student)
            ->getJson('/api/tokens/balance');

        $response->assertStatus(200);
        $response->assertJson(['balance' => 0]);
    }

    public function test_token_ledger_integrity(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        StudentProfile::create([
            'user_id' => $student->id,
            'education_level' => 'Universitario',
        ]);

        // Purchase 100 tokens
        Token::create([
            'user_id' => $student->id,
            'quantity' => 100,
            'transaction_type' => 'purchase',
            'amount' => 10.00,
            'tokens_before' => 0,
            'tokens_after' => 100,
            'description' => 'Compra',
        ]);

        // Spend 20 tokens
        Token::create([
            'user_id' => $student->id,
            'quantity' => 20,
            'transaction_type' => 'session_payment',
            'amount' => 0,
            'tokens_before' => 100,
            'tokens_after' => 80,
            'description' => 'Pago de sesión',
        ]);

        $response = $this->actingAs($student)
            ->getJson('/api/tokens/balance');

        $response->assertStatus(200);
        $response->assertJson(['balance' => 80]);
    }
}

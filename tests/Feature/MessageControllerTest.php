<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tutor = User::factory()->create(['role' => 'tutor', 'is_active' => true]);
        $this->tutorProfile = $this->tutor->tutorProfile()->create([
            'title' => 'Prof',
            'education' => 'UCV',
            'experience' => '5',
            'rate' => 50,
            'status' => 'approved',
        ]);

        $this->student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $this->student->studentProfile()->create(['education_level' => 'Universitario']);
    }

    public function test_student_can_view_messages_index(): void
    {
        $this->actingAs($this->student);
        $response = $this->get('/messages');
        $response->assertStatus(200);
    }

    public function test_tutor_can_view_messages_index(): void
    {
        $this->actingAs($this->tutor);
        $response = $this->get('/messages');
        $response->assertStatus(200);
    }

    public function test_student_can_start_conversation_with_tutor(): void
    {
        $this->actingAs($this->student);

        $response = $this->post('/conversations', [
            'tutor_profile_id' => $this->tutorProfile->id,
            'message' => 'Hola profesor, necesito ayuda',
        ]);

        $this->assertDatabaseHas('conversations', [
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
        ]);

        $this->assertDatabaseHas('messages', [
            'sender_user_id' => $this->student->id,
            'content' => 'Hola profesor, necesito ayuda',
        ]);
    }

    public function test_user_can_send_message_in_conversation(): void
    {
        $conversation = Conversation::create([
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
        ]);

        $this->actingAs($this->student);
        $response = $this->post('/messages', [
            'conversation_id' => $conversation->id,
            'content' => 'Nueva consulta',
        ]);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_user_id' => $this->student->id,
            'content' => 'Nueva consulta',
        ]);
    }

    public function test_user_can_view_conversation(): void
    {
        $conversation = Conversation::create([
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
        ]);

        $this->actingAs($this->student);
        $response = $this->get("/messages/{$conversation->id}");
        $response->assertStatus(200);
    }

    public function test_user_can_delete_conversation(): void
    {
        $conversation = Conversation::create([
            'student_user_id' => $this->student->id,
            'tutor_profile_id' => $this->tutorProfile->id,
        ]);

        $this->actingAs($this->student);
        $response = $this->delete("/messages/{$conversation->id}");

        $this->assertDatabaseMissing('conversations', [
            'id' => $conversation->id,
        ]);
    }

    public function test_guest_cannot_access_messages(): void
    {
        $response = $this->get('/messages');
        $response->assertRedirect('/login');
    }
}

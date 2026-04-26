<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_notifications(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        Notification::create([
            'user_id' => $user->id,
            'title' => 'Test Notification',
            'message' => 'This is a test',
            'type' => 'info',
        ]);

        $this->actingAs($user);
        $response = $this->get('/notifications');
        $response->assertStatus(200);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $notification = Notification::create([
            'user_id' => $user->id,
            'title' => 'Unread',
            'message' => 'Unread message',
            'type' => 'info',
        ]);

        $this->actingAs($user);
        $this->post("/notifications/{$notification->id}/read");

        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        Notification::create(['user_id' => $user->id, 'title' => 'N1', 'message' => 'M1', 'type' => 'info']);
        Notification::create(['user_id' => $user->id, 'title' => 'N2', 'message' => 'M2', 'type' => 'info']);

        $this->actingAs($user);
        $this->post('/notifications/read-all');

        $this->assertEquals(0, Notification::where('user_id', $user->id)->unread()->count());
    }

    public function test_unread_count_api_returns_correct_count(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        Notification::create(['user_id' => $user->id, 'title' => 'Unread', 'message' => 'U', 'type' => 'info']);
        Notification::create(['user_id' => $user->id, 'title' => 'Read', 'message' => 'R', 'type' => 'info', 'is_read' => true]);

        $this->actingAs($user);
        $response = $this->get('/api/notifications/unread');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('count'));
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\TutoringSession;

class SessionCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TutoringSession $session,
        public int $tokensEarned
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('whiteboard.' . $this->session->id),
            new PrivateChannel('notifications.' . $this->session->student_user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id'      => $this->session->id,
            'status'          => $this->session->status,
            'ended_at'        => $this->session->ended_at?->toIso8601String(),
            'duration_minutes' => $this->session->duration_minutes,
            'tokens_earned'   => $this->tokensEarned,
            'message'         => 'La sesión ha finalizado.',
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.completed';
    }
}

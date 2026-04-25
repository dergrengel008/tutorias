<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\TutoringSession;

class SessionStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TutoringSession $session
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('whiteboard.' . $this->session->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id'  => $this->session->id,
            'status'      => $this->session->status,
            'started_at'  => $this->session->started_at?->toIso8601String(),
            'message'     => 'La sesión ha comenzado.',
        ];
    }

    public function broadcastAs(): string
    {
        return 'session.started';
    }
}

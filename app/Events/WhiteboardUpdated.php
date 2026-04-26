<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhiteboardUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sessionId,
        public string $whiteboardData,
        public int $userId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('whiteboard.' . $this->sessionId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'whiteboard_data' => $this->whiteboardData,
            'user_id' => $this->userId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'whiteboard.updated';
    }
}

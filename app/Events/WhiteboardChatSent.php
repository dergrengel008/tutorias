<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhiteboardChatSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sessionId,
        public array $message
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
            'message' => $this->message,
        ];
    }

    public function broadcastAs(): string
    {
        return 'whiteboard.chat.sent';
    }
}

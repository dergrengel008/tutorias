<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\TutorProfile;

class TutorApproved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TutorProfile $tutorProfile
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->tutorProfile->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'tutor_profile_id' => $this->tutorProfile->id,
            'user_id'          => $this->tutorProfile->user_id,
            'status'           => $this->tutorProfile->status,
            'message'          => '¡Tu perfil de tutor ha sido aprobado!',
        ];
    }

    public function broadcastAs(): string
    {
        return 'tutor.approved';
    }
}

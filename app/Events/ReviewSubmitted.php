<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Review;

class ReviewSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Review $review
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->review->tutorProfile->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'review_id'        => $this->review->id,
            'tutor_profile_id' => $this->review->tutor_profile_id,
            'rating'           => $this->review->rating,
            'comment'          => $this->review->comment,
            'type'             => $this->review->type,
            'reviewer_name'    => $this->review->is_anonymous ? 'Anónimo' : optional($this->review->reviewer)->name,
            'message'          => $this->review->type === 'warning'
                ? 'Has recibido una advertencia.'
                : 'Has recibido una nueva reseña.',
        ];
    }

    public function broadcastAs(): string
    {
        return 'review.submitted';
    }
}

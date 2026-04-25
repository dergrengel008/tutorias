<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SessionBookedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $recipient;
    public string $sessionTitle;
    public string $scheduledAt;
    public string $tutorName;
    public string $studentName;
    public int $tokens;

    public function __construct(
        User $recipient,
        string $sessionTitle,
        string $scheduledAt,
        string $tutorName,
        string $studentName,
        int $tokens
    ) {
        $this->recipient = $recipient;
        $this->sessionTitle = $sessionTitle;
        $this->scheduledAt = $scheduledAt;
        $this->tutorName = $tutorName;
        $this->studentName = $studentName;
        $this->tokens = $tokens;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva sesión programada - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.session-booked',
            with: [
                'name' => $this->recipient->name,
                'role' => $this->recipient->role,
                'sessionTitle' => $this->sessionTitle,
                'scheduledAt' => $this->scheduledAt,
                'tutorName' => $this->tutorName,
                'studentName' => $this->studentName,
                'tokens' => $this->tokens,
            ],
        );
    }
}

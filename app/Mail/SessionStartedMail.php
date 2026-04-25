<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SessionStartedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $sessionTitle;
    public string $whiteboardUrl;

    public function __construct(User $user, string $sessionTitle, string $whiteboardUrl)
    {
        $this->user = $user;
        $this->sessionTitle = $sessionTitle;
        $this->whiteboardUrl = $whiteboardUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu sesión ha comenzado - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.session-started',
            with: [
                'name' => $this->user->name,
                'sessionTitle' => $this->sessionTitle,
                'whiteboardUrl' => $this->whiteboardUrl,
            ],
        );
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SessionCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $recipient;
    public string $sessionTitle;
    public string $reason;
    public int $tokensRefunded;

    public function __construct(
        User $recipient,
        string $sessionTitle,
        string $reason = '',
        int $tokensRefunded = 0
    ) {
        $this->recipient = $recipient;
        $this->sessionTitle = $sessionTitle;
        $this->reason = $reason;
        $this->tokensRefunded = $tokensRefunded;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Sesión cancelada - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.session-cancelled',
            with: [
                'name' => $this->recipient->name,
                'role' => $this->recipient->role,
                'sessionTitle' => $this->sessionTitle,
                'reason' => $this->reason,
                'tokensRefunded' => $this->tokensRefunded,
            ],
        );
    }
}

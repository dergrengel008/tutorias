<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class SessionCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $recipient;
    public string $sessionTitle;
    public int $tokens;
    public int $earnedTokens;
    public string $ratingUrl;

    public function __construct(
        User $recipient,
        string $sessionTitle,
        int $tokens,
        int $earnedTokens = 0,
        string $ratingUrl = ''
    ) {
        $this->recipient = $recipient;
        $this->sessionTitle = $sessionTitle;
        $this->tokens = $tokens;
        $this->earnedTokens = $earnedTokens;
        $this->ratingUrl = $ratingUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Sesión completada - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.session-completed',
            with: [
                'name' => $this->recipient->name,
                'role' => $this->recipient->role,
                'sessionTitle' => $this->sessionTitle,
                'tokens' => $this->tokens,
                'earnedTokens' => $this->earnedTokens,
                'ratingUrl' => $this->ratingUrl,
            ],
        );
    }
}

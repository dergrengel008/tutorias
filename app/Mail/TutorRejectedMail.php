<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class TutorRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $reason;

    public function __construct(User $user, string $reason)
    {
        $this->user = $user;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu perfil no fue aprobado - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tutor-rejected',
            with: [
                'name' => $this->user->name,
                'reason' => $this->reason,
            ],
        );
    }
}

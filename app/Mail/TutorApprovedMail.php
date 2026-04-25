<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class TutorApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Tu perfil ha sido aprobado! - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tutor-approved',
            with: [
                'name' => $this->user->name,
            ],
        );
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class WarningReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $severity;
    public string $reason;

    public function __construct(User $user, string $severity, string $reason)
    {
        $this->user = $user;
        $this->severity = $severity;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Has recibido una amonestación - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.warning-received',
            with: [
                'name' => $this->user->name,
                'severity' => $this->severity,
                'reason' => $this->reason,
            ],
        );
    }
}

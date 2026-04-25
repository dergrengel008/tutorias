<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class PaymentApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public int $tokens;
    public int $newBalance;

    public function __construct(User $user, int $tokens, int $newBalance)
    {
        $this->user = $user;
        $this->tokens = $tokens;
        $this->newBalance = $newBalance;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recarga aprobada - TutoriaApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-approved',
            with: [
                'name' => $this->user->name,
                'tokens' => $this->tokens,
                'newBalance' => $this->newBalance,
            ],
        );
    }
}

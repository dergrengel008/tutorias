<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Mail\PasswordResetMail;
use App\Mail\PaymentApprovedMail;
use App\Mail\PaymentRejectedMail;
use App\Mail\SessionBookedMail;
use App\Mail\SessionCancelledMail;
use App\Mail\SessionCompletedMail;
use App\Mail\SessionStartedMail;
use App\Mail\TutorApprovedMail;
use App\Mail\TutorRejectedMail;
use App\Mail\WarningReceivedMail;
use App\Mail\WelcomeMail;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send a notification (database + optional email) to a user.
     */
    public static function notify(
        User $user,
        string $title,
        string $message,
        string $type,
        array $data = [],
        bool $sendEmail = true,
        ?string $mailableClass = null,
        array $mailableParams = []
    ): void {
        // Always create database notification
        Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);

        // Send email if enabled and user has verified email
        if ($sendEmail && $mailableClass && $user->email_verified_at) {
            try {
                $mailable = new $mailableClass(...$mailableParams);
                Mail::to($user->email)->send($mailable);
            } catch (\Exception $e) {
                Log::error('Failed to send notification email: ' . $e->getMessage(), [
                    'user_id' => $user->id,
                    'mailable' => $mailableClass,
                ]);
            }
        }
    }

    // ─── Convenience Methods ─────────────────────────────────────────

    /**
     * Send password reset notification.
     */
    public static function sendPasswordReset(User $user, string $token): void
    {
        self::notify(
            user: $user,
            title: 'Restablece tu contraseña',
            message: 'Hemos recibido una solicitud para restablecer tu contraseña.',
            type: 'password_reset',
            data: ['token' => $token],
            mailableClass: PasswordResetMail::class,
            mailableParams: [$user, $token]
        );
    }

    /**
     * Send email verification notification.
     */
    public static function sendEmailVerification(User $user, string $verificationUrl): void
    {
        self::notify(
            user: $user,
            title: 'Verifica tu correo electrónico',
            message: 'Por favor verifica tu dirección de correo electrónico.',
            type: 'email_verification',
            data: ['verification_url' => $verificationUrl],
            sendEmail: true,
            mailableClass: EmailVerificationMail::class,
            mailableParams: [$user, $verificationUrl]
        );
    }

    /**
     * Send session booked notification to student.
     */
    public static function sendSessionBookedToStudent(
        User $student,
        string $sessionTitle,
        string $scheduledAt,
        string $tutorName,
        string $studentName,
        int $tokens
    ): void {
        self::notify(
            user: $student,
            title: 'Sesión programada',
            message: "Tu sesión \"{$sessionTitle}\" con {$tutorName} ha sido programada para el {$scheduledAt}.",
            type: 'session_booked',
            data: ['session_title' => $sessionTitle, 'scheduled_at' => $scheduledAt, 'tokens' => $tokens],
            mailableClass: SessionBookedMail::class,
            mailableParams: [$student, $sessionTitle, $scheduledAt, $tutorName, $studentName, $tokens]
        );
    }

    /**
     * Send session booked notification to tutor.
     */
    public static function sendSessionBookedToTutor(
        User $tutor,
        string $sessionTitle,
        string $scheduledAt,
        string $tutorName,
        string $studentName,
        int $tokens
    ): void {
        self::notify(
            user: $tutor,
            title: 'Nueva sesión reservada',
            message: "{$studentName} ha reservado la sesión \"{$sessionTitle}\" para el {$scheduledAt}.",
            type: 'session_booked',
            data: ['session_title' => $sessionTitle, 'scheduled_at' => $scheduledAt, 'tokens' => $tokens],
            mailableClass: SessionBookedMail::class,
            mailableParams: [$tutor, $sessionTitle, $scheduledAt, $tutorName, $studentName, $tokens]
        );
    }

    /**
     * Send session started notification.
     */
    public static function sendSessionStarted(User $user, string $sessionTitle, string $whiteboardUrl): void
    {
        self::notify(
            user: $user,
            title: 'Sesión iniciada',
            message: "La sesión \"{$sessionTitle}\" ha comenzado.",
            type: 'session_started',
            data: ['session_title' => $sessionTitle, 'whiteboard_url' => $whiteboardUrl],
            mailableClass: SessionStartedMail::class,
            mailableParams: [$user, $sessionTitle, $whiteboardUrl]
        );
    }

    /**
     * Send session completed notification to student.
     */
    public static function sendSessionCompletedToStudent(
        User $student,
        string $sessionTitle,
        int $tokens,
        string $ratingUrl = ''
    ): void {
        self::notify(
            user: $student,
            title: 'Sesión completada',
            message: "La sesión \"{$sessionTitle}\" ha sido completada exitosamente.",
            type: 'session_completed',
            data: ['session_title' => $sessionTitle, 'tokens' => $tokens, 'rating_url' => $ratingUrl],
            mailableClass: SessionCompletedMail::class,
            mailableParams: [$student, $sessionTitle, $tokens, 0, $ratingUrl]
        );
    }

    /**
     * Send session completed notification to tutor.
     */
    public static function sendSessionCompletedToTutor(
        User $tutor,
        string $sessionTitle,
        int $tokens,
        int $earnedTokens
    ): void {
        self::notify(
            user: $tutor,
            title: 'Sesión completada',
            message: "La sesión \"{$sessionTitle}\" ha sido completada. Has ganado {$earnedTokens} tokens.",
            type: 'session_completed',
            data: ['session_title' => $sessionTitle, 'tokens' => $tokens, 'earned_tokens' => $earnedTokens],
            mailableClass: SessionCompletedMail::class,
            mailableParams: [$tutor, $sessionTitle, $tokens, $earnedTokens, '']
        );
    }

    /**
     * Send session cancelled notification.
     */
    public static function sendSessionCancelled(
        User $user,
        string $sessionTitle,
        string $reason = '',
        int $tokensRefunded = 0
    ): void {
        self::notify(
            user: $user,
            title: 'Sesión cancelada',
            message: "La sesión \"{$sessionTitle}\" ha sido cancelada.",
            type: 'session_cancelled',
            data: ['session_title' => $sessionTitle, 'reason' => $reason, 'tokens_refunded' => $tokensRefunded],
            mailableClass: SessionCancelledMail::class,
            mailableParams: [$user, $sessionTitle, $reason, $tokensRefunded]
        );
    }

    /**
     * Send tutor profile approved notification.
     */
    public static function sendTutorApproved(User $user): void
    {
        self::notify(
            user: $user,
            title: 'Perfil aprobado',
            message: '¡Tu perfil de tutor ha sido aprobado! Ya puedes comenzar a recibir estudiantes.',
            type: 'tutor_approved',
            mailableClass: TutorApprovedMail::class,
            mailableParams: [$user]
        );
    }

    /**
     * Send tutor profile rejected notification.
     */
    public static function sendTutorRejected(User $user, string $reason): void
    {
        self::notify(
            user: $user,
            title: 'Perfil no aprobado',
            message: 'Tu solicitud de perfil de tutor no ha sido aprobada.',
            type: 'tutor_rejected',
            data: ['reason' => $reason],
            mailableClass: TutorRejectedMail::class,
            mailableParams: [$user, $reason]
        );
    }

    /**
     * Send payment approved notification.
     */
    public static function sendPaymentApproved(User $user, int $tokens, int $newBalance): void
    {
        self::notify(
            user: $user,
            title: 'Recarga aprobada',
            message: "Tu recarga de {$tokens} tokens ha sido aprobada. Tu nuevo saldo es {$newBalance} tokens.",
            type: 'payment_approved',
            data: ['tokens' => $tokens, 'new_balance' => $newBalance],
            mailableClass: PaymentApprovedMail::class,
            mailableParams: [$user, $tokens, $newBalance]
        );
    }

    /**
     * Send payment rejected notification.
     */
    public static function sendPaymentRejected(User $user, string $reason): void
    {
        self::notify(
            user: $user,
            title: 'Recarga rechazada',
            message: 'Tu solicitud de recarga de tokens no pudo ser procesada.',
            type: 'payment_rejected',
            data: ['reason' => $reason],
            mailableClass: PaymentRejectedMail::class,
            mailableParams: [$user, $reason]
        );
    }

    /**
     * Send warning received notification.
     */
    public static function sendWarningReceived(User $user, string $severity, string $reason): void
    {
        self::notify(
            user: $user,
            title: 'Amonestación recibida',
            message: "Has recibido una amonestación de severidad \"{$severity}\".",
            type: 'warning_received',
            data: ['severity' => $severity, 'reason' => $reason],
            mailableClass: WarningReceivedMail::class,
            mailableParams: [$user, $severity, $reason]
        );
    }

    /**
     * Send welcome notification.
     */
    public static function sendWelcome(User $user, string $role): void
    {
        $roleLabel = $role === 'tutor' ? 'tutor' : 'estudiante';
        self::notify(
            user: $user,
            title: '¡Bienvenido a TutoriaApp!',
            message: "Tu cuenta como {$roleLabel} ha sido creada exitosamente.",
            type: 'welcome',
            data: ['role' => $role],
            mailableClass: WelcomeMail::class,
            mailableParams: [$user, $role]
        );
    }
}

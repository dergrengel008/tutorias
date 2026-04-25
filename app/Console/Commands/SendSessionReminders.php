<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TutoringSession;
use App\Models\Notification;
use Carbon\Carbon;

class SendSessionReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:remind {--hours-before=2 : Horas de anticipación para el recordatorio}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía recordatorios de sesiones próximas a estudiantes y tutores (1h y 24h antes).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hoursBefore = (int) $this->option('hours-before');
        $now = Carbon::now();
        $scheduledSessions = TutoringSession::where('status', 'scheduled')
            ->where('scheduled_at', '>', $now)
            ->where('scheduled_at', '<=', $now->copy()->addHours($hoursBefore))
            ->with(['tutorProfile.user', 'student'])
            ->get();

        if ($scheduledSessions->isEmpty()) {
            $this->info('No hay sesiones próximas para recordar.');
            return self::SUCCESS;
        }

        $remindersCreated = 0;

        foreach ($scheduledSessions as $session) {
            $scheduledAt = Carbon::parse($session->scheduled_at);
            $diffInHours = $now->diffInHours($scheduledAt, false);
            $timeLabel = $diffInHours >= 24
                ? 'mañana'
                : ($diffInHours === 1 ? 'en 1 hora' : "en {$diffInHours} horas");

            $studentName = $session->student?->name ?? 'Estudiante';
            $tutorName = $session->tutorProfile?->user?->name ?? 'Tutor';

            // Determine reminder window label
            if ($diffInHours <= 1) {
                $windowLabel = '1h';
            } elseif ($diffInHours <= 24) {
                $windowLabel = '24h';
            } else {
                // Only remind for sessions within 24 hours
                continue;
            }

            // Notification to STUDENT
            $this->createReminderIfNeeded(
                userId: $session->student_user_id,
                session: $session,
                window: $windowLabel,
                title: "Recordatorio: {$session->title}",
                message: "Tienes una sesión {$timeLabel} con {$tutorName}. Tema: {$session->title}.",
            );

            // Notification to TUTOR
            if ($session->tutorProfile && $session->tutorProfile->user_id) {
                $this->createReminderIfNeeded(
                    userId: $session->tutorProfile->user_id,
                    session: $session,
                    window: $windowLabel,
                    title: "Recordatorio: {$session->title}",
                    message: "Tienes una sesión {$timeLabel} con {$studentName}. Tema: {$session->title}.",
                );
            }

            $remindersCreated++;
        }

        $this->info("Se enviaron recordatorios para {$remindersCreated} sesión(es).");

        return self::SUCCESS;
    }

    /**
     * Create a reminder notification only if one hasn't been sent for this session/window combination.
     */
    private function createReminderIfNeeded(
        int $userId,
        TutoringSession $session,
        string $window,
        string $title,
        string $message,
    ): void {
        $alreadySent = Notification::where('user_id', $userId)
            ->where('type', 'session_reminder')
            ->where('data->session_id', $session->id)
            ->where('data->reminder_window', $window)
            ->exists();

        if ($alreadySent) {
            return;
        }

        Notification::create([
            'user_id'  => $userId,
            'title'    => $title,
            'message'  => $message,
            'type'     => 'session_reminder',
            'is_read'  => false,
            'data'     => [
                'session_id'       => $session->id,
                'reminder_window'  => $window,
                'scheduled_at'     => $session->scheduled_at?->toIso8601String(),
            ],
        ]);
    }
}

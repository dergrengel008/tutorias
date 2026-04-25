<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Token;
use App\Models\Notification;
use App\Models\Review;
use Carbon\Carbon;
use App\Events\SessionStarted;
use App\Events\SessionCompleted;

class SessionController extends Controller
{
    public function index()
    {
        $sessions = TutoringSession::with(['tutorProfile.user', 'student', 'reviews'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Sessions', [
            'sessions' => $sessions,
        ]);
    }

    public function book(Request $request)
    {
        $validated = $request->validate([
            'tutor_profile_id' => 'required|exists:tutor_profiles,id',
            'specialty_id'     => 'required|exists:specialties,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string|max:2000',
            'scheduled_at'     => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
        ]);

        $studentId = Auth::id();
        $tutorProfile = TutorProfile::where('id', $validated['tutor_profile_id'])
            ->where('status', 'approved')
            ->firstOrFail();

        // Prevent booking with yourself
        if ($tutorProfile->user_id === $studentId) {
            return back()->withErrors(['tutor_profile_id' => 'No puedes reservar una sesión contigo mismo.']);
        }

        // Calculate token cost server-side from specialty
        $specialty = \App\Models\Specialty::where('id', $validated['specialty_id'])->firstOrFail();
        $tokensCost = $specialty->tokens_cost ?? 0;
        if ($tokensCost <= 0) {
            return back()->withErrors(['tokens_cost' => 'Esta especialidad no tiene un costo de tokens configurado.']);
        }

        // Calculate tutor earnings (80% of tokens - platform commission)
        $platformCommission = \App\Models\PlatformSetting::where('key', 'commission_rate')->first()?->value ?? 20;
        $commissionRate = (float) $platformCommission / 100;
        $tutorEarned = (int) ceil($tokensCost * (1 - $commissionRate));

        return DB::transaction(function () use ($validated, $studentId, $tutorProfile, $tutorEarned, $tokensCost) {
            // Lock token row to prevent race conditions
            $latestToken = Token::where('user_id', $studentId)->lockForUpdate()->latest()->first();
            $currentBalance = $latestToken ? $latestToken->tokens_after : 0;

            if ($currentBalance < $tokensCost) {
                throw new \Illuminate\Validation\ValidationException(
                    validator(null, []),
                    ['tokens_cost' => 'No tienes suficientes tokens. Saldo actual: ' . $currentBalance . ' tokens.']
                );
            }

            // Create session
            $session = TutoringSession::create([
                'tutor_profile_id'  => $tutorProfile->id,
                'student_user_id'   => $studentId,
                'title'             => $validated['title'],
                'description'       => $validated['description'],
                'scheduled_at'      => $validated['scheduled_at'],
                'duration_minutes'  => $validated['duration_minutes'],
                'status'            => 'scheduled',
                'tokens_cost'       => $tokensCost,
                'tutor_earned_tokens' => $tutorEarned,
                'meeting_link'      => $this->generateMeetingLink(),
            ]);

            // Deduct tokens from student
            $tokensAfter = $currentBalance - $tokensCost;

            Token::create([
                'user_id'          => $studentId,
                'quantity'         => $tokensCost,
                'transaction_type' => 'session_payment',
                'amount'           => 0,
                'tokens_before'    => $currentBalance,
                'tokens_after'     => $tokensAfter,
                'description'      => "Reserva de sesión: {$validated['title']}",
                'reference'        => "session_{$session->id}",
            ]);

            // Notify tutor
            Notification::create([
                'user_id'  => $tutorProfile->user_id,
                'title'    => 'Nueva sesión reservada',
                'message'  => Auth::user()->name . ' ha reservado una sesión: ' . $validated['title'],
                'type'     => 'session_booked',
                'data'     => [
                    'session_id'       => $session->id,
                    'student_name'     => Auth::user()->name,
                    'scheduled_at'     => $validated['scheduled_at'],
                ],
            ]);

            return redirect()->route('sessions.show', $session->id)
                ->with('success', 'Sesión reservada exitosamente.');
        });
    }

    public function start($id)
    {
        $session = TutoringSession::findOrFail($id);

        // Only the tutor can start the session
        $tutorProfile = Auth::user()->tutorProfile;
        if (! $tutorProfile || $tutorProfile->id !== $session->tutor_profile_id) {
            abort(403, 'Solo el tutor puede iniciar esta sesión.');
        }

        if ($session->status !== 'scheduled') {
            return back()->withErrors(['error' => 'Esta sesión no puede ser iniciada.']);
        }

        $session->update([
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);

        // Notify student
        Notification::create([
            'user_id'  => $session->student_user_id,
            'title'    => 'Sesión iniciada',
            'message'  => 'La sesión "' . $session->title . '" ha comenzado.',
            'type'     => 'session_started',
            'data'     => [
                'session_id' => $session->id,
            ],
        ]);

        event(new SessionStarted($session));

        return redirect()->route('whiteboard.show', $session->id)
            ->with('success', 'Sesión iniciada exitosamente.');
    }

    public function end($id)
    {
        $session = TutoringSession::findOrFail($id);

        // Only the tutor can end the session
        $tutorProfile = Auth::user()->tutorProfile;
        if (! $tutorProfile || $tutorProfile->id !== $session->tutor_profile_id) {
            abort(403, 'Solo el tutor puede finalizar esta sesión.');
        }

        if ($session->status !== 'in_progress') {
            return back()->withErrors(['error' => 'Esta sesión no está en curso.']);
        }

        $endedAt = now();
        $startedAt = $session->started_at;
        $durationMinutes = $startedAt ? $startedAt->diffInMinutes($endedAt) : $session->duration_minutes;

        $session->update([
            'status'          => 'completed',
            'ended_at'        => $endedAt,
            'duration_minutes' => $durationMinutes,
        ]);

        // Credit tokens to tutor (with race condition protection)
        $tutorId = $tutorProfile->user_id;
        
        DB::transaction(function () use ($tutorId, $session) {
            $latestToken = Token::where('user_id', $tutorId)->lockForUpdate()->latest()->first();
            $tokensBefore = $latestToken ? $latestToken->tokens_after : 0;
            $tokensAfter = $tokensBefore + $session->tutor_earned_tokens;

            Token::create([
                'user_id'          => $tutorId,
                'quantity'         => $session->tutor_earned_tokens,
                'transaction_type' => 'session_payment',
                'amount'           => 0,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensAfter,
                'description'      => "Pago por sesión completada: {$session->title}",
                'reference'        => "session_{$session->id}",
            ]);
        });

        // Update tutor stats
        $tutorProfile->increment('total_sessions');

        // Update student stats
        StudentProfile::where('user_id', $session->student_user_id)
            ->increment('total_sessions_completed');

        // Notify student
        Notification::create([
            'user_id'  => $session->student_user_id,
            'title'    => 'Sesión completada',
            'message'  => "La sesión \"{$session->title}\" ha finalizado. Duración: {$durationMinutes} minutos.",
            'type'     => 'session_completed',
            'data'     => [
                'session_id'       => $session->id,
                'duration_minutes' => $durationMinutes,
            ],
        ]);

        event(new SessionCompleted($session, $session->tutor_earned_tokens));

        return redirect()->route('tutor.sessions')
            ->with('success', 'Sesión finalizada exitosamente. Tokens ganados: ' . $session->tutor_earned_tokens);
    }

    public function cancel($id)
    {
        $session = TutoringSession::findOrFail($id);

        $userId = Auth::id();
        $isTutor = $session->tutorProfile && $session->tutorProfile->user_id === $userId;
        $isStudent = $session->student_user_id === $userId;

        if (! $isTutor && ! $isStudent) {
            abort(403, 'No tienes permiso para cancelar esta sesión.');
        }

        if (! in_array($session->status, ['scheduled'])) {
            return back()->withErrors(['error' => 'Solo se pueden cancelar sesiones programadas.']);
        }

        return DB::transaction(function () use ($session, $userId) {
            $session->update(['status' => 'cancelled']);

            // Refund tokens to student (with locking)
            $studentId = $session->student_user_id;
            $latestToken = Token::where('user_id', $studentId)->lockForUpdate()->latest()->first();
            $tokensBefore = $latestToken ? $latestToken->tokens_after : 0;
            $tokensAfter = $tokensBefore + $session->tokens_cost;

            Token::create([
                'user_id'          => $studentId,
                'quantity'         => $session->tokens_cost,
                'transaction_type' => 'refund',
                'amount'           => 0,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensAfter,
                'description'      => "Reembolso por sesión cancelada: {$session->title}",
                'reference'        => "refund_session_{$session->id}",
            ]);

            // Notify the other party
            $notifyUserId = $userId === $session->student_user_id
                ? $session->tutorProfile->user_id
                : $session->student_user_id;

            Notification::create([
                'user_id'  => $notifyUserId,
                'title'    => 'Sesión cancelada',
                'message'  => "La sesión \"{$session->title}\" ha sido cancelada.",
                'type'     => 'session_cancelled',
                'data'     => [
                    'session_id' => $session->id,
                ],
            ]);

            return redirect()->back()
                ->with('success', 'Sesión cancelada. Los tokens han sido reembolsados.');
        });
    }

    public function show($id)
    {
        $session = TutoringSession::with([
            'tutorProfile.user',
            'tutorProfile.specialties',
            'student',
            'reviews',
        ])->findOrFail($id);

        // Check access
        $userId = Auth::id();
        $isParticipant = $session->student_user_id === $userId
            || ($session->tutorProfile && $session->tutorProfile->user_id === $userId);

        if (! $isParticipant && ! Auth::user()->isAdmin()) {
            abort(403);
        }

        $canReview = $session->status === 'completed'
            && $session->student_user_id === $userId
            && ! Review::where('tutoring_session_id', $session->id)
                ->where('reviewer_user_id', $userId)
                ->where('type', 'review')
                ->exists();

        $existingReview = Review::where('tutoring_session_id', $session->id)
            ->where('reviewer_user_id', $userId)
            ->where('type', 'review')
            ->first();

        return Inertia::render('Sessions/Show', [
            'session'        => $session,
            'canReview'      => $canReview,
            'existingReview' => $existingReview,
        ]);
    }

    public function updateWhiteboard(Request $request)
    {
        $validated = $request->validate([
            'session_id'       => 'required|exists:tutoring_sessions,id',
            'whiteboard_data' => 'required|json',
        ]);

        $session = TutoringSession::findOrFail($validated['session_id']);

        $userId = Auth::id();
        $isParticipant = $session->student_user_id === $userId
            || ($session->tutorProfile && $session->tutorProfile->user_id === $userId);

        if (! $isParticipant) {
            abort(403);
        }

        $session->update([
            'whiteboard_data' => $validated['whiteboard_data'],
        ]);

        return response()->json(['message' => 'Pizarra guardada exitosamente.']);
    }

    public function getWhiteboardData($id)
    {
        $session = TutoringSession::findOrFail($id);

        $userId = Auth::id();
        $isParticipant = $session->student_user_id === $userId
            || ($session->tutorProfile && $session->tutorProfile->user_id === $userId);

        if (! $isParticipant) {
            abort(403);
        }

        return response()->json([
            'whiteboard_data' => $session->whiteboard_data,
        ]);
    }

    private function getUserTokenBalance(int $userId): int
    {
        $latestToken = Token::where('user_id', $userId)->latest()->first();
        return $latestToken ? $latestToken->tokens_after : 0;
    }

    private function generateMeetingLink(): string
    {
        return 'https://meet.jit.si/tutoria-' . \Illuminate\Support\Str::uuid()->toString();
    }
}

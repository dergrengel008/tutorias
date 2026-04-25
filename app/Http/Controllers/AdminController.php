<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use App\Models\TutoringSession;
use App\Models\Token;
use App\Models\Review;
use App\Models\Notification;
use App\Models\PaymentReceipt;
use App\Events\TutorApproved;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'totalUsers'      => User::count(),
            'totalTutors'     => User::where('role', 'tutor')->count(),
            'approvedTutors'  => TutorProfile::where('status', 'approved')->count(),
            'pendingTutors'   => TutorProfile::where('status', 'pending')->count(),
            'totalStudents'   => User::where('role', 'student')->count(),
            'totalSessions'   => TutoringSession::count(),
            'completedSessions' => TutoringSession::where('status', 'completed')->count(),
            'totalRevenue'    => Token::where('transaction_type', 'purchase')->sum('amount'),
            'totalTokensTraded' => Token::where('transaction_type', 'session_payment')->where('description', 'LIKE', 'Reembolso%')->count() === 0
                ? Token::where('transaction_type', 'session_payment')->sum('quantity')
                : 0,
            'pendingPayments' => PaymentReceipt::where('status', 'pending')->count(),
        ];

        $recentSessions = TutoringSession::with(['tutorProfile.user', 'student'])
            ->latest()
            ->limit(10)
            ->get();

        $recentTutors = TutorProfile::with(['user'])
            ->latest()
            ->limit(5)
            ->get();

        // ─── Chart Data: Monthly Revenue (last 6 months) ───
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('Y-m');
            $label = $date->locale('es')->translatedFormat('M');
            $tokensSold = Token::where('transaction_type', 'purchase')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('quantity');
            $sessionsCompleted = TutoringSession::where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $monthlyRevenue[] = [
                'month'      => $label,
                'tokens'     => (int) $tokensSold,
                'sessions'   => $sessionsCompleted,
            ];
        }

        // ─── Chart Data: User Growth (last 6 months) ───
        $userGrowth = [];
        $cumulativeTutors = 0;
        $cumulativeStudents = 0;
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('Y-m');
            $monthLabel = $date->locale('es')->translatedFormat('M');
            $cumulativeTutors = User::where('role', 'tutor')
                ->where('created_at', '<=', $date->endOfMonth())
                ->count();
            $cumulativeStudents = User::where('role', 'student')
                ->where('created_at', '<=', $date->endOfMonth())
                ->count();
            $userGrowth[] = [
                'month'    => $monthLabel,
                'tutores'  => $cumulativeTutors,
                'estudiantes' => $cumulativeStudents,
            ];
        }

        // ─── Chart Data: Sessions by Status ───
        $sessionsByStatus = [
            ['estado' => 'Programadas', 'cantidad' => TutoringSession::where('status', 'scheduled')->count()],
            ['estado' => 'En Progreso', 'cantidad' => TutoringSession::where('status', 'in_progress')->count()],
            ['estado' => 'Completadas', 'cantidad' => TutoringSession::where('status', 'completed')->count()],
            ['estado' => 'Canceladas', 'cantidad' => TutoringSession::where('status', 'cancelled')->count()],
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'            => $stats,
            'recentSessions'   => $recentSessions,
            'recentTutors'     => $recentTutors,
            'monthlyRevenue'   => $monthlyRevenue,
            'userGrowth'       => $userGrowth,
            'sessionsByStatus' => $sessionsByStatus,
        ]);
    }

    public function pendingTutors()
    {
        $pendingTutors = TutorProfile::where('status', 'pending')
            ->with(['user', 'specialties'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/PendingTutors', [
            'pendingTutors' => $pendingTutors,
        ]);
    }

    public function approveTutor($id)
    {
        $tutor = TutorProfile::findOrFail($id);
        $tutor->update([
            'status'        => 'approved',
            'is_approved'   => true,
            'approval_date' => now(),
        ]);

        // Notify tutor
        Notification::create([
            'user_id'  => $tutor->user_id,
            'title'    => '¡Felicidades! Tu perfil ha sido aprobado',
            'message'  => 'Tu perfil de tutor ha sido verificado y aprobado. Ya puedes comenzar a recibir sesiones.',
            'type'     => 'tutor_approved',
            'data'     => [
                'tutor_profile_id' => $tutor->id,
            ],
        ]);

        event(new TutorApproved($tutor));

        return redirect()->back()->with('success', 'Tutor aprobado exitosamente.');
    }

    public function rejectTutor(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $tutor = TutorProfile::findOrFail($id);
        $tutor->update([
            'status'           => 'rejected',
            'is_approved'      => false,
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        // Notify tutor
        Notification::create([
            'user_id'  => $tutor->user_id,
            'title'    => 'Perfil rechazado',
            'message'  => 'Tu perfil de tutor ha sido rechazado. Motivo: ' . $validated['rejection_reason'],
            'type'     => 'tutor_rejected',
            'data'     => [
                'tutor_profile_id' => $tutor->id,
                'reason'           => $validated['rejection_reason'],
            ],
        ]);

        return redirect()->back()->with('success', 'Tutor rechazado.');
    }

    public function suspendTutor($id)
    {
        $tutor = TutorProfile::findOrFail($id);
        
        DB::transaction(function () use ($tutor) {
            $tutor->update(['status' => 'suspended']);
            $tutor->user->update(['is_active' => false]);

            TutoringSession::where('tutor_profile_id', $tutor->id)
                ->where('status', 'scheduled')
                ->each(function ($session) {
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
                        'description'      => "Reembolso por suspensión del tutor: {$session->title}",
                        'reference'        => "refund_suspension_{$session->id}",
                    ]);

                    $session->update(['status' => 'cancelled']);

                    Notification::create([
                        'user_id'  => $studentId,
                        'title'    => 'Sesión cancelada',
                        'message'  => "La sesión \"{$session->title}\" ha sido cancelada porque el tutor fue suspendido.",
                        'type'     => 'session_cancelled',
                        'data'     => ['session_id' => $session->id],
                    ]);
                });
        });

        // Notify tutor
        Notification::create([
            'user_id'  => $tutor->user_id,
            'title'    => 'Cuenta suspendida',
            'message'  => 'Tu cuenta de tutor ha sido suspendida. Contacta al administrador para más información.',
            'type'     => 'tutor_suspended',
            'data'     => ['tutor_profile_id' => $tutor->id],
        ]);

        return redirect()->back()->with('success', 'Tutor suspendido exitosamente.');
    }

    public function activateTutor($id)
    {
        $tutor = TutorProfile::findOrFail($id);
        $tutor->update([
            'status'    => 'approved',
            'is_approved' => true,
        ]);

        // Reactivate the user
        $tutor->user->update(['is_active' => true]);

        // Notify tutor
        Notification::create([
            'user_id'  => $tutor->user_id,
            'title'    => 'Cuenta reactivada',
            'message'  => 'Tu cuenta de tutor ha sido reactivada. Ya puedes continuar dando clases.',
            'type'     => 'tutor_reactivated',
            'data'     => ['tutor_profile_id' => $tutor->id],
        ]);

        return redirect()->back()->with('success', 'Tutor reactivado exitosamente.');
    }

    public function allTutors(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:approved,pending,rejected,suspended',
            'search' => 'nullable|string|max:255',
        ]);

        $query = TutorProfile::with(['user', 'specialties']);

        // Filters
        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['search'])) {
            $search = str_replace(['%', '_'], ['\%', '\_'], $validated['search']);
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $tutors = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/AllTutors', [
            'tutors'  => $tutors,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function allStudents(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $query = User::where('role', 'student')->with('studentProfile');

        if (! empty($validated['search'])) {
            $search = str_replace(['%', '_'], ['\%', '\_'], $validated['search']);
            $query->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
        }

        $students = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/AllStudents', [
            'students' => $students,
            'filters'  => $request->only(['search']),
        ]);
    }

    /**
     * Show a single student's detail page.
     */
    public function showStudent($id)
    {
        $student = User::where('role', 'student')
            ->where('id', $id)
            ->with(['studentProfile', 'tokens', 'tutoringSessions' => function ($q) {
                $q->with('tutorProfile.user')->latest()->limit(10);
            }])
            ->firstOrFail();

        return Inertia::render('Admin/ShowStudent', [
            'student' => $student,
        ]);
    }

    /**
     * Activate a student account.
     */
    public function activateStudent($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->update(['is_active' => true]);

        Notification::create([
            'user_id'  => $student->id,
            'title'    => 'Cuenta activada',
            'message'  => 'Tu cuenta ha sido activada por un administrador.',
            'type'     => 'account_activated',
        ]);

        return redirect()->back()->with('success', 'Estudiante activado correctamente.');
    }

    /**
     * Deactivate a student account.
     */
    public function deactivateStudent($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->update(['is_active' => false]);

        Notification::create([
            'user_id'  => $student->id,
            'title'    => 'Cuenta desactivada',
            'message'  => 'Tu cuenta ha sido desactivada por un administrador. Contacta soporte si crees que es un error.',
            'type'     => 'account_deactivated',
        ]);

        return redirect()->back()->with('success', 'Estudiante desactivado correctamente.');
    }

    public function sessions(Request $request)
    {
        $validated = $request->validate([
            'status'   => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = TutoringSession::with(['tutorProfile.user', 'student']);

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['date_from'])) {
            $query->where('scheduled_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->where('scheduled_at', '<=', $validated['date_to']);
        }

        $sessions = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Sessions', [
            'sessions' => $sessions,
            'filters'  => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    public function manageSpecialties()
    {
        $specialties = Specialty::withCount('tutors')->get();

        return Inertia::render('Admin/Specialties', [
            'specialties' => $specialties,
        ]);
    }

    public function storeSpecialty(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:specialties,name',
            'description' => 'nullable|string|max:500',
            'icon'        => 'nullable|string|max:100',
        ]);

        Specialty::create($validated);

        return redirect()->back()->with('success', 'Especialidad creada exitosamente.');
    }

    public function updateSpecialty(Request $request, $id)
    {
        $specialty = Specialty::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:specialties,name,' . $id,
            'description' => 'nullable|string|max:500',
            'icon'        => 'nullable|string|max:100',
        ]);

        $specialty->update($validated);

        return redirect()->back()->with('success', 'Especialidad actualizada exitosamente.');
    }

    public function destroySpecialty($id)
    {
        $specialty = Specialty::findOrFail($id);
        $specialty->tutors()->detach();
        $specialty->delete();

        return redirect()->back()->with('success', 'Especialidad eliminada exitosamente.');
    }

    public function giveTokens(Request $request)
    {
        $validated = $request->validate([
            'user_id'     => 'required|exists:users,id',
            'quantity'    => 'required|integer|min:1|max:100000',
            'description' => 'nullable|string|max:500',
        ]);

        $userId = $validated['user_id'];
        $quantity = $validated['quantity'];
        $description = $validated['description'] ?? 'Crédito otorgado por administrador';

        DB::transaction(function () use ($userId, $quantity, $description) {
            $latestToken = Token::where('user_id', $userId)->lockForUpdate()->latest()->first();
            $tokensBefore = $latestToken ? $latestToken->tokens_after : 0;
            $tokensAfter = $tokensBefore + $quantity;

            Token::create([
                'user_id'          => $userId,
                'quantity'         => $quantity,
                'transaction_type' => 'admin_credit',
                'amount'           => 0,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensAfter,
                'description'      => $description,
                'reference'        => 'admin_credit_' . Auth::id() . '_' . now()->timestamp,
            ]);

            // Notify user
            Notification::create([
                'user_id'  => $userId,
                'title'    => 'Tokens recibidos',
                'message'  => "Has recibido {$quantity} tokens. {$description}",
                'type'     => 'tokens_received',
                'data'     => [
                    'quantity'    => $quantity,
                    'new_balance' => $tokensAfter,
                ],
            ]);
        });

        return redirect()->back()->with('success', "Se han acreditado {$quantity} tokens al usuario.");
    }

    public function manageReviews(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|in:review,warning',
        ]);

        $query = Review::with(['reviewer', 'tutorProfile.user', 'session']);

        if (! empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $reviews = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
            'filters' => $request->only(['type']),
        ]);
    }

    public function destroyReview($id)
    {
        $review = Review::findOrFail($id);

        // Recalculate tutor average rating
        $tutor = $review->tutorProfile;
        $remainingReviews = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'review')
            ->where('id', '!=', $id)
            ->get();

        if ($remainingReviews->count() > 0) {
            $newAverage = $remainingReviews->avg('rating');
            $tutor->update(['average_rating' => round($newAverage, 2)]);
        } else {
            $tutor->update(['average_rating' => 0]);
        }

        // If it was a warning, decrement total_warnings
        if ($review->type === 'warning') {
            $tutor->decrement('total_warnings');
        }

        $review->delete();

        return redirect()->back()->with('success', 'Reseña eliminada exitosamente.');
    }

    public function warnings()
    {
        // Get all warnings (reviews with type='warning')
        // adminReviewer = the admin who created the warning (stored in reviewer_id)
        $warnings = Review::where('type', 'warning')
            ->with(['tutorProfile.user', 'adminReviewer'])
            ->latest()
            ->paginate(20);

        // Get approved + suspended tutors for the dropdown (active or previously active)
        $tutors = TutorProfile::whereIn('status', ['approved', 'suspended'])
            ->with(['user', 'specialties'])
            ->orderBy('user_id')
            ->get();

        return Inertia::render('Admin/Warnings', [
            'warnings' => $warnings,
            'tutors'   => $tutors,
        ]);
    }

    public function storeWarning(Request $request)
    {
        $validated = $request->validate([
            'tutor_profile_id' => 'required|exists:tutor_profiles,id',
            'reason'           => 'required|string|max:1000',
            'severity'         => 'required|in:low,medium,high',
        ]);

        $tutor = TutorProfile::findOrFail($validated['tutor_profile_id']);

        // Increment warnings count on tutor profile
        $tutor->increment('total_warnings');

        // Create the warning as a review first (reviewer_user_id nullable — warnings have no student reviewer)
        Review::create([
            'tutoring_session_id' => null,
            'reviewer_user_id'    => null,
            'tutor_profile_id'    => $tutor->id,
            'reviewer_id'         => Auth::id(),
            'rating'              => 0,
            'comment'             => $validated['reason'],
            'type'                => 'warning',
            'is_anonymous'        => false,
            'severity'            => $validated['severity'],
        ]);

        // Auto-suspend if 3+ high severity warnings (count AFTER insert)
        $highWarnings = Review::where('tutor_profile_id', $tutor->id)
            ->where('type', 'warning')
            ->where('severity', 'high')
            ->count();

        if ($highWarnings >= 3 && $tutor->status === 'approved') {
            $tutor->update(['status' => 'suspended']);
            Notification::create([
                'user_id'  => $tutor->user_id,
                'title'    => 'Cuenta suspendida automáticamente',
                'message'  => 'Tu cuenta ha sido suspendida automáticamente por acumular 3 alertas graves.',
                'type'     => 'tutor_suspended',
                'data'     => ['tutor_profile_id' => $tutor->id],
            ]);
        }

        // Notify tutor
        $severityLabels = ['low' => 'leve', 'medium' => 'moderada', 'high' => 'grave'];
        Notification::create([
            'user_id'  => $tutor->user_id,
            'title'    => 'Alerta recibida',
            'message'  => "Has recibido una alerta {$severityLabels[$validated['severity']]}. Motivo: {$validated['reason']}",
            'type'     => 'warning_received',
            'data'     => [
                'tutor_profile_id' => $tutor->id,
                'severity'         => $validated['severity'],
            ],
        ]);

        return redirect()->back()->with('success', 'Alerta emitida exitosamente.');
    }

    /**
     * Muestra la lista de recibos de pago (Pago Móvil) para aprobación.
     */
    public function paymentReceipts(Request $request)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
            'search' => 'nullable|string|max:255',
        ]);

        $query = PaymentReceipt::with(['user']);

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['search'])) {
            $search = str_replace(['%', '_'], ['\%', '\_'], $validated['search']);
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $receipts = $query->latest()->paginate(20)->withQueryString();

        $pendingCount = PaymentReceipt::where('status', 'pending')->count();

        return Inertia::render('Admin/PaymentReceipts', [
            'receipts'     => $receipts,
            'filters'      => $request->only(['status', 'search']),
            'pendingCount' => $pendingCount,
        ]);
    }
}

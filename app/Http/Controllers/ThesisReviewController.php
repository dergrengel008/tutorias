<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\ThesisReview;
use App\Models\ThesisFeedback;
use App\Models\TutorProfile;
use App\Models\Token;
use App\Models\Notification;
use Carbon\Carbon;

class ThesisReviewController extends Controller
{
    // ─── Token costs by academic level ────────────────────────────
    private const LEVEL_COSTS = [
        'pregrado'  => 50,
        'maestria'  => 100,
        'doctorado' => 150,
    ];

    // ─── STUDENT ACTIONS ──────────────────────────────────────────

    /**
     * Student: list their thesis reviews
     */
    public function studentIndex()
    {
        $reviews = ThesisReview::where('student_user_id', Auth::id())
            ->with(['tutorProfile.user', 'latestFeedback'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Student/Thesis/Index', [
            'reviews' => $reviews,
        ]);
    }

    /**
     * Student: show create form
     */
    public function studentCreate()
    {
        // Get approved tutors
        $tutors = TutorProfile::where('status', 'approved')
            ->with(['user', 'specialties'])
            ->get();

        return Inertia::render('Student/Thesis/Create', [
            'tutors'   => $tutors,
            'levelCosts' => self::LEVEL_COSTS,
        ]);
    }

    /**
     * Student: store new thesis review request
     */
    public function studentStore(Request $request)
    {
        $validated = $request->validate([
            'tutor_profile_id'   => 'required|exists:tutor_profiles,id',
            'title'              => 'required|string|max:255',
            'academic_level'     => 'required|in:pregrado,maestria,doctorado',
            'subject_area'       => 'nullable|string|max:255',
            'instructions'       => 'nullable|string|max:5000',
            'file'               => 'required|file|mimes:pdf|max:51200', // 50MB max
        ]);

        $tutor = TutorProfile::where('id', $validated['tutor_profile_id'])
            ->where('status', 'approved')
            ->firstOrFail();

        // Can't submit to yourself
        if ($tutor->user_id === Auth::id()) {
            return back()->withErrors(['tutor_profile_id' => 'No puedes enviarte una tesis a ti mismo.']);
        }

        $tokensCost = self::LEVEL_COSTS[$validated['academic_level']];
        $tutorEarned = (int) ceil($tokensCost * 0.8);

        return DB::transaction(function () use ($validated, $tutor, $tokensCost, $tutorEarned, $request) {
            // Lock token balance row to prevent race conditions
            $latestToken = Token::where('user_id', Auth::id())->lockForUpdate()->latest()->first();
            $balance = $latestToken ? $latestToken->tokens_after : 0;

            if ($balance < $tokensCost) {
                abort(403, "No tienes suficientes tokens. Necesitas {$tokensCost}, tienes {$balance}.");
            }
            // Upload file with descriptive name
            $filePath = null;
            $originalName = null;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $directory = "thesis/{$request->user()->id}";
                $descriptiveName = $this->generateThesisFilename($validated['title'], $request->user()->name);
                $filePath = $file->storeAs($directory, $descriptiveName, 'public');
                $originalName = $file->getClientOriginalName();
            }

            // Calculate deadline (7 days from now)
            $deadline = Carbon::now()->addDays(7);

            $review = ThesisReview::create([
                'student_user_id'     => Auth::id(),
                'tutor_profile_id'    => $tutor->id,
                'title'               => $validated['title'],
                'academic_level'      => $validated['academic_level'],
                'subject_area'        => $validated['subject_area'],
                'instructions'        => $validated['instructions'],
                'file_path'           => $filePath,
                'original_filename'   => $originalName,
                'tokens_cost'         => $tokensCost,
                'tutor_earned_tokens' => $tutorEarned,
                'status'              => 'pending',
                'current_round'       => 1,
                'max_rounds'          => 3,
                'deadline'            => $deadline,
            ]);

            // Deduct tokens
            $tokensBefore = $balance;
            Token::create([
                'user_id'          => Auth::id(),
                'quantity'         => $tokensCost,
                'transaction_type' => 'thesis_review',
                'amount'           => 0,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensBefore - $tokensCost,
                'description'      => "Revisión de tesis: {$validated['title']}",
                'reference'        => "thesis_{$review->id}",
            ]);

            // Notify tutor
            Notification::create([
                'user_id'  => $tutor->user_id,
                'title'    => 'Nueva solicitud de revisión de tesis',
                'message'  => Auth::user()->name . ' ha solicitado una revisión: ' . $validated['title'],
                'type'     => 'session_booked',
                'data'     => [
                    'thesis_review_id' => $review->id,
                    'student_name'     => Auth::user()->name,
                    'academic_level'   => $validated['academic_level'],
                ],
            ]);

            return redirect()->route('student.thesis.show', $review->id)
                ->with('success', 'Solicitud de revisión enviada. Tokens descontados: ' . $tokensCost);
        });
    }

    /**
     * Student: show thesis review detail
     */
    public function studentShow($id)
    {
        $review = ThesisReview::where('id', $id)
            ->where('student_user_id', Auth::id())
            ->with(['tutorProfile.user', 'tutorProfile.specialties', 'feedbacks'])
            ->firstOrFail();

        return Inertia::render('Student/Thesis/Show', [
            'review' => $review,
        ]);
    }

    /**
     * Student: request a new revision round
     */
    public function studentRequestRevision(Request $request, $id)
    {
        $review = ThesisReview::where('id', $id)
            ->where('student_user_id', Auth::id())
            ->firstOrFail();

        if ($review->status !== 'completed' && $review->status !== 'needs_revision') {
            return back()->withErrors(['error' => 'Solo puedes solicitar revisión de tesis completadas o que necesitan correcciones.']);
        }

        if ($review->current_round >= $review->max_rounds) {
            return back()->withErrors(['error' => 'Has alcanzado el máximo de rondas de revisión (' . $review->max_rounds . ').'  ]);
        }

        $validated = $request->validate([
            'revision_notes'  => 'required|string|max:5000',
            'file'            => 'nullable|file|mimes:pdf|max:51200',
        ]);

        return DB::transaction(function () use ($review, $validated, $request) {
            // Upload new version with descriptive name
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $student = $review->student;
                $roundLabel = "R{$review->current_round}";
                $descriptiveName = $this->generateThesisFilename(
                    "{$review->title} ({$roundLabel})",
                    $student ? $student->name : 'Estudiante'
                );
                $filePath = $file->storeAs("thesis/{$review->student_user_id}", $descriptiveName, 'public');
                $review->update([
                    'file_path'         => $filePath,
                    'original_filename' => $file->getClientOriginalName(),
                ]);
            }

            $review->update([
                'status'        => 'pending',
                'current_round' => $review->current_round + 1,
            ]);

            // Notify tutor
            Notification::create([
                'user_id'  => $review->tutorProfile->user_id,
                'title'    => 'Nueva ronda de revisión solicitada',
                'message'  => "El estudiante ha solicitado la ronda {$review->current_round} de revisión para: {$review->title}",
                'type'     => 'session_booked',
                'data'     => [
                    'thesis_review_id' => $review->id,
                    'round_number'     => $review->current_round,
                    'revision_notes'   => $validated['revision_notes'],
                ],
            ]);

            return back()->with('success', "Ronda {$review->current_round} de revisión solicitada.");
        });
    }

    /**
     * Student: rate the tutor after completion
     */
    public function studentRate(Request $request, $id)
    {
        $review = ThesisReview::where('id', $id)
            ->where('student_user_id', Auth::id())
            ->where('status', 'completed')
            ->firstOrFail();

        if ($review->final_rating) {
            return back()->withErrors(['error' => 'Ya has calificado esta revisión.']);
        }

        $validated = $request->validate([
            'rating'   => 'required|integer|min:1|max:5',
        ]);

        $review->update(['final_rating' => $validated['rating']]);

        // Update tutor average
        $allRatings = ThesisReview::where('tutor_profile_id', $review->tutor_profile_id)
            ->where('final_rating', '>', 0)
            ->pluck('final_rating');
        $newAvg = $allRatings->avg();
        $review->tutorProfile->update(['average_rating' => round($newAvg, 2)]);

        return back()->with('success', 'Calificación guardada. Gracias por tu opinión.');
    }

    /**
     * Student: cancel thesis review
     */
    public function studentCancel($id)
    {
        $review = ThesisReview::where('id', $id)
            ->where('student_user_id', Auth::id())
            ->whereIn('status', ['pending'])
            ->firstOrFail();

        return DB::transaction(function () use ($review) {
            $review->update(['status' => 'cancelled']);

            // Refund tokens
            $studentId = $review->student_user_id;
            $tokensBefore = $this->getTokenBalance($studentId);
            Token::create([
                'user_id'          => $studentId,
                'quantity'         => $review->tokens_cost,
                'transaction_type' => 'refund',
                'amount'           => 0,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensBefore + $review->tokens_cost,
                'description'      => "Reembolso por cancelación de revisión: {$review->title}",
                'reference'        => "refund_thesis_{$review->id}",
            ]);

            Notification::create([
                'user_id'  => $review->tutorProfile->user_id,
                'title'    => 'Revisión de tesis cancelada',
                'message'  => "La revisión \"{$review->title}\" ha sido cancelada por el estudiante.",
                'type'     => 'session_cancelled',
                'data'     => ['thesis_review_id' => $review->id],
            ]);

            return redirect()->route('student.thesis.index')
                ->with('success', 'Revisión cancelada. Tokens reembolsados: ' . $review->tokens_cost);
        });
    }

    // ─── TUTOR ACTIONS ────────────────────────────────────────────

    /**
     * Tutor: list thesis reviews to review
     */
    public function tutorIndex()
    {
        $tutor = Auth::user()->tutorProfile;
        if (! $tutor) {
            return Inertia::render('Tutor/Thesis/Index', ['reviews' => []]);
        }

        $reviews = ThesisReview::where('tutor_profile_id', $tutor->id)
            ->whereIn('status', ['pending', 'in_review', 'needs_revision'])
            ->with(['student', 'latestFeedback'])
            ->latest()
            ->paginate(10);

        $completed = ThesisReview::where('tutor_profile_id', $tutor->id)
            ->where('status', 'completed')
            ->count();

        return Inertia::render('Tutor/Thesis/Index', [
            'reviews'        => $reviews,
            'completedCount' => $completed,
        ]);
    }

    /**
     * Tutor: show thesis review detail
     */
    public function tutorShow($id)
    {
        $tutor = Auth::user()->tutorProfile;
        if (! $tutor) {
            abort(403, 'No tienes perfil de tutor.');
        }

        $review = ThesisReview::where('id', $id)
            ->where('tutor_profile_id', $tutor->id)
            ->with(['student', 'feedbacks'])
            ->firstOrFail();

        return Inertia::render('Tutor/Thesis/Show', [
            'review' => $review,
        ]);
    }

    /**
     * Tutor: accept review request
     */
    public function tutorAccept($id)
    {
        $tutor = Auth::user()->tutorProfile;
        if (! $tutor) {
            abort(403);
        }

        $review = ThesisReview::where('id', $id)
            ->where('tutor_profile_id', $tutor->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $review->update([
            'status'      => 'in_review',
            'accepted_at' => now(),
        ]);

        Notification::create([
            'user_id'  => $review->student_user_id,
            'title'    => 'Tu tesis está siendo revisada',
            'message'  => "El tutor ha aceptado revisar: {$review->title}",
            'type'     => 'session_started',
            'data'     => ['thesis_review_id' => $review->id],
        ]);

        return back()->with('success', 'Revisión aceptada.');
    }

    /**
     * Tutor: submit feedback for current round
     */
    public function tutorSubmitFeedback(Request $request, $id)
    {
        $tutor = Auth::user()->tutorProfile;
        if (! $tutor) {
            abort(403);
        }

        $review = ThesisReview::where('id', $id)
            ->where('tutor_profile_id', $tutor->id)
            ->whereIn('status', ['in_review', 'needs_revision'])
            ->firstOrFail();

        $validated = $request->validate([
            'overall_comments'    => 'required|string|max:10000',
            'structure_rating'    => 'required|integer|min:1|max:5',
            'content_rating'      => 'required|integer|min:1|max:5',
            'methodology_rating'  => 'required|integer|min:1|max:5',
            'writing_rating'      => 'required|integer|min:1|max:5',
            'references_rating'   => 'required|integer|min:1|max:5',
            'annotated_file'      => 'nullable|file|mimes:pdf|max:51200',
            'action'              => 'required|in:complete,needs_revision',
        ]);

        return DB::transaction(function () use ($review, $validated, $request) {
            $annotatedPath = null;
            $annotatedName = null;

            if ($request->hasFile('annotated_file')) {
                $file = $request->file('annotated_file');
                $tutor = Auth::user();
                $descriptiveName = $this->generateAnnotatedFilename(
                    $review->title,
                    $review->current_round,
                    $tutor->name
                );
                $annotatedPath = $file->storeAs("thesis/annotated/{$review->id}", $descriptiveName, 'public');
                $annotatedName = $file->getClientOriginalName();
            }

            // Save or update feedback (allow re-submitting for same round)
            $feedbackData = [
                'overall_comments'    => $validated['overall_comments'],
                'structure_rating'    => $validated['structure_rating'],
                'content_rating'      => $validated['content_rating'],
                'methodology_rating'  => $validated['methodology_rating'],
                'writing_rating'      => $validated['writing_rating'],
                'references_rating'   => $validated['references_rating'],
            ];

            if ($annotatedPath) {
                $feedbackData['annotated_file_path'] = $annotatedPath;
                $feedbackData['annotated_filename'] = $annotatedName;
            }

            ThesisFeedback::updateOrCreate(
                [
                    'thesis_review_id' => $review->id,
                    'round_number'     => $review->current_round,
                ],
                $feedbackData,
            );

            $isComplete = $validated['action'] === 'complete';
            $newStatus = $isComplete ? 'completed' : 'needs_revision';

            $review->update([
                'status'       => $newStatus,
                'completed_at' => $isComplete ? now() : null,
            ]);

            if ($isComplete) {
                // Credit tokens to tutor
                $tutorId = $review->tutorProfile->user_id;
                $tokensBefore = $this->getTokenBalance($tutorId);
                Token::create([
                    'user_id'          => $tutorId,
                    'quantity'         => $review->tutor_earned_tokens,
                    'transaction_type' => 'thesis_review',
                    'amount'           => 0,
                    'tokens_before'    => $tokensBefore,
                    'tokens_after'     => $tokensBefore + $review->tutor_earned_tokens,
                    'description'      => "Pago por revisión de tesis completada: {$review->title}",
                    'reference'        => "thesis_{$review->id}",
                ]);

                $review->tutorProfile->increment('total_sessions');

                Notification::create([
                    'user_id'  => $review->student_user_id,
                    'title'    => 'Revisión de tesis completada',
                    'message'  => "La revisión de \"{$review->title}\" ha sido completada. Revisa los comentarios.",
                    'type'     => 'session_completed',
                    'data'     => ['thesis_review_id' => $review->id],
                ]);
            } else {
                Notification::create([
                    'user_id'  => $review->student_user_id,
                    'title'    => 'Tu tesis necesita correcciones',
                    'message'  => "La revisión de \"{$review->title}\" requiere correcciones. Revisa los comentarios.",
                    'type'     => 'session_completed',
                    'data'     => ['thesis_review_id' => $review->id],
                ]);
            }

            $actionLabel = $isComplete ? 'completada' : 'marcada para correcciones';
            return redirect()->route('tutor.thesis.index')
                ->with('success', "Revisión {$actionLabel} (Ronda {$review->current_round}).");
        });
    }

    /**
     * Tutor: download thesis file
     */
    public function tutorDownload($id)
    {
        $tutor = Auth::user()->tutorProfile;
        if (! $tutor) {
            abort(403);
        }

        $review = ThesisReview::where('id', $id)
            ->where('tutor_profile_id', $tutor->id)
            ->firstOrFail();

        if (! $review->file_path || ! Storage::disk('public')->exists($review->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        return Storage::disk('public')->download($review->file_path, $review->original_filename);
    }

    // ─── ADMIN ACTIONS ────────────────────────────────────────────

    /**
     * Admin: list all thesis reviews
     */
    public function adminIndex(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = ThesisReview::with(['student', 'tutorProfile.user', 'latestFeedback']);

        if ($status !== 'all' && in_array($status, ['pending', 'in_review', 'needs_revision', 'completed', 'cancelled'])) {
            $query->where('status', $status);
        }

        $reviews = $query->latest()->paginate(20)->withQueryString();

        // Compute stats
        $stats = [
            'total'          => ThesisReview::count(),
            'pending'        => ThesisReview::where('status', 'pending')->count(),
            'in_review'      => ThesisReview::where('status', 'in_review')->count(),
            'needs_revision' => ThesisReview::where('status', 'needs_revision')->count(),
            'completed'      => ThesisReview::where('status', 'completed')->count(),
            'cancelled'      => ThesisReview::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Admin/Thesis/Index', [
            'reviews' => $reviews,
            'stats'   => $stats,
            'filters' => ['status' => $status],
        ]);
    }

    /**
     * Admin: cancel a thesis review
     */
    public function adminCancel($id)
    {
        $review = ThesisReview::findOrFail($id);

        if (! in_array($review->status, ['pending', 'in_review', 'needs_revision'])) {
            return back()->withErrors(['error' => 'Solo se pueden cancelar revisiones activas.']);
        }

        return DB::transaction(function () use ($review) {
            $oldStatus = $review->status;
            $review->update(['status' => 'cancelled']);

            // Refund if tokens were deducted (not if already completed)
            if ($oldStatus !== 'completed') {
                $studentId = $review->student_user_id;
                $tokensBefore = $this->getTokenBalance($studentId);
                Token::create([
                    'user_id'          => $studentId,
                    'quantity'         => $review->tokens_cost,
                    'transaction_type' => 'refund',
                    'amount'           => 0,
                    'tokens_before'    => $tokensBefore,
                    'tokens_after'     => $tokensBefore + $review->tokens_cost,
                    'description'      => "Reembolso admin por cancelación de revisión: {$review->title}",
                    'reference'        => "refund_thesis_admin_{$review->id}",
                ]);
            }

            Notification::create([
                'user_id'  => $review->student_user_id,
                'title'    => 'Revisión de tesis cancelada por admin',
                'message'  => "La revisión \"{$review->title}\" ha sido cancelada.",
                'type'     => 'session_cancelled',
                'data'     => ['thesis_review_id' => $review->id],
            ]);

            Notification::create([
                'user_id'  => $review->tutorProfile->user_id,
                'title'    => 'Revisión de tesis cancelada por admin',
                'message'  => "La revisión \"{$review->title}\" ha sido cancelada.",
                'type'     => 'session_cancelled',
                'data'     => ['thesis_review_id' => $review->id],
            ]);

            return back()->with('success', 'Revisión cancelada y tokens reembolsados.');
        });
    }

    // ─── SHARED: Download files ───────────────────────────────────

    public function downloadFile($id)
    {
        $review = ThesisReview::findOrFail($id);
        $userId = Auth::id();

        if ($review->student_user_id !== $userId && $review->tutorProfile?->user_id !== $userId && ! Auth::user()->isAdmin()) {
            abort(403);
        }

        if (! $review->file_path || ! Storage::disk('public')->exists($review->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($review->file_path, $review->original_filename);
    }

    public function downloadAnnotated($feedbackId)
    {
        $feedback = ThesisFeedback::findOrFail($feedbackId);
        $review = $feedback->thesisReview;
        $userId = Auth::id();

        if ($review->student_user_id !== $userId && $review->tutorProfile?->user_id !== $userId && ! Auth::user()->isAdmin()) {
            abort(403);
        }

        if (! $feedback->annotated_file_path || ! Storage::disk('public')->exists($feedback->annotated_file_path)) {
            abort(404);
        }

        return Storage::disk('public')->download($feedback->annotated_file_path, $feedback->annotated_filename);
    }

    // ─── HELPERS ──────────────────────────────────────────────────

    /**
     * Generate a descriptive filename for thesis uploads.
     * Format: [Titulo]_[NombreEstudiante]_[fecha].pdf
     */
    private function generateThesisFilename(string $title, string $studentName): string
    {
        $cleanTitle = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/u', '', $title);
        $cleanTitle = trim(preg_replace('/\s+/', '_', $cleanTitle));
        $cleanTitle = mb_substr($cleanTitle, 0, 60);

        $cleanName = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/u', '', $studentName);
        $cleanName = trim(preg_replace('/\s+/', '_', $cleanName));
        $cleanName = mb_substr($cleanName, 0, 30);

        $date = now()->format('Y-m-d');

        return "{$cleanTitle}_{$cleanName}_{$date}.pdf";
    }

    /**
     * Generate a descriptive filename for annotated thesis files.
     * Format: [Titulo]_Anotada_Ronda[N]_[TutorNombre]_[fecha].pdf
     */
    private function generateAnnotatedFilename(string $title, int $round, string $tutorName): string
    {
        $cleanTitle = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/u', '', $title);
        $cleanTitle = trim(preg_replace('/\s+/', '_', $cleanTitle));
        $cleanTitle = mb_substr($cleanTitle, 0, 60);

        $cleanTutor = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/u', '', $tutorName);
        $cleanTutor = trim(preg_replace('/\s+/', '_', $cleanTutor));
        $cleanTutor = mb_substr($cleanTutor, 0, 30);

        $date = now()->format('Y-m-d');

        return "{$cleanTitle}_Anotada_R{$round}_{$cleanTutor}_{$date}.pdf";
    }

    private function getTokenBalance(int $userId): int
    {
        $latestToken = Token::where('user_id', $userId)->latest()->first();
        return $latestToken ? $latestToken->tokens_after : 0;
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TutoringSession;

class WhiteboardController extends Controller
{
    /**
     * Get the whiteboard data for a session.
     */
    public function show($sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        // Verify the user is part of this session (tutor or student)
        $user = Auth::user();
        $isParticipant = $session->tutor_profile_id === ($user->tutorProfile->id ?? null)
            || $session->student_user_id === $user->id
            || $user->isAdmin();

        if (! $isParticipant) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json([
            'data' => $session->whiteboard_data,
            'specialty' => $session->specialty ? $session->specialty->name : null,
            'type' => $session->whiteboard_type ?? 'excalidraw',
        ]);
    }

    /**
     * Update whiteboard data for a session.
     */
    public function update(Request $request, $sessionId)
    {
        $session = TutoringSession::findOrFail($sessionId);

        $user = Auth::user();
        $isTutor = $session->tutor_profile_id === ($user->tutorProfile->id ?? null);
        $isStudent = $session->student_user_id === $user->id;
        $isAdmin = $user->isAdmin();

        if (! $isTutor && ! $isStudent && ! $isAdmin) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'data'      => 'required',
            'specialty' => 'nullable|string|max:255',
        ]);

        // Use direct property assignment to bypass $fillable restrictions
        $session->whiteboard_data = $validated['data'];
        $session->whiteboard_type = $this->detectWhiteboardType($validated['specialty'] ?? null);
        $session->save();

        return response()->json([
            'message' => 'Pizarra guardada exitosamente.',
        ]);
    }

    /**
     * Determine the whiteboard type based on the specialty.
     */
    private function detectWhiteboardType(?string $specialty): string
    {
        if (! $specialty) {
            return 'excalidraw';
        }

        $mathSpecialties = [
            'matemáticas', 'matematicas', 'math', 'álgebra', 'algebra',
            'calculo', 'cálculo', 'estadística', 'estadistica',
            'trigonometria', 'geometria',
        ];

        $lower = strtolower(trim($specialty));

        foreach ($mathSpecialties as $math) {
            if (str_contains($lower, $math)) {
                return 'math_latex';
            }
        }

        return 'excalidraw';
    }
}

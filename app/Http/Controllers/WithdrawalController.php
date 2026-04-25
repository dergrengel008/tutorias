<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Withdrawal;
use App\Models\TutorProfile;
use App\Models\Token;
use App\Models\Notification;
use App\Models\PlatformSetting;

class WithdrawalController extends Controller
{
    /**
     * Admin lists all withdrawals with optional status filter.
     */
    public function index(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $query = Withdrawal::with(['tutorProfile.user', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate(20);

        return Inertia::render('Admin/Withdrawals', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only('status'),
        ]);
    }

    /**
     * Tutor requests a withdrawal.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $tutorProfile = $user->tutorProfile;

        if (!$tutorProfile) {
            return back()->withErrors(['error' => 'Solo los tutores pueden solicitar retiros.']);
        }

        $minWithdrawal = PlatformSetting::get('min_withdrawal_tokens', 100);
        $tokenPrice = PlatformSetting::get('token_price_usd', 0.1);

        $validated = $request->validate([
            'amount' => 'required|integer|min:' . $minWithdrawal,
            'payment_method' => 'required|string|max:50',
            'payment_details' => 'required|string|max:500',
        ]);

        // Check for pending withdrawals
        $hasPending = Withdrawal::where('tutor_profile_id', $tutorProfile->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->withErrors(['error' => 'Ya tienes una solicitud de retiro pendiente.']);
        }

        $dollarAmount = $validated['amount'] * $tokenPrice;

        return DB::transaction(function () use ($tutorProfile, $validated, $dollarAmount, $user) {
            // Lock token balance row to prevent race conditions
            $latestToken = Token::where('user_id', $tutorProfile->user_id)->lockForUpdate()->latest()->first();
            $tutorBalance = $latestToken ? $latestToken->tokens_after : 0;

            if ($tutorBalance < $validated['amount']) {
                abort(403, 'No tienes suficientes tokens ganados. Saldo disponible: ' . $tutorBalance . ' tokens.');
            }

            $withdrawal = Withdrawal::create([
                'tutor_profile_id' => $tutorProfile->id,
                'amount' => $validated['amount'],
                'dollar_amount' => $dollarAmount,
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'payment_details' => $validated['payment_details'],
            ]);

            // Notify admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'Nueva solicitud de retiro',
                    'message' => "{$user->name} ha solicitado un retiro de {$validated['amount']} tokens (\${$dollarAmount}).",
                    'type' => 'withdrawal_requested',
                    'data' => [
                        'withdrawal_id' => $withdrawal->id,
                        'tutor_name' => $user->name,
                        'amount' => $validated['amount'],
                    ],
                ]);
            }

            return back()->with('success', 'Solicitud de retiro enviada exitosamente.');
        });
    }

    /**
     * Admin approves a withdrawal.
     */
    public function approve(Request $request, $id)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $withdrawal = Withdrawal::with('tutorProfile')->findOrFail($id);

        if (!$withdrawal->isPending()) {
            return back()->withErrors(['error' => 'Esta solicitud ya ha sido procesada.']);
        }

        return DB::transaction(function () use ($withdrawal, $request) {
            $tutorId = $withdrawal->tutorProfile->user_id;
            $tokensBefore = $this->getUserTokenBalance($tutorId);
            $tokensAfter = $tokensBefore - $withdrawal->amount;

            // Deduct tokens from tutor balance
            Token::create([
                'user_id' => $tutorId,
                'quantity' => $withdrawal->amount,
                'transaction_type' => 'withdrawal',
                'amount' => $withdrawal->dollar_amount,
                'tokens_before' => $tokensBefore,
                'tokens_after' => max(0, $tokensAfter),
                'description' => "Retiro aprobado - {$withdrawal->payment_method}",
                'reference' => "withdrawal_{$withdrawal->id}",
            ]);

            $withdrawal->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'admin_notes' => $request->input('admin_notes'),
            ]);

            // Notify tutor
            Notification::create([
                'user_id' => $tutorId,
                'title' => 'Retiro aprobado',
                'message' => "Tu solicitud de retiro de {$withdrawal->amount} tokens (\${$withdrawal->dollar_amount}) ha sido aprobada. Se procesará a través de {$withdrawal->payment_method}.",
                'type' => 'withdrawal_approved',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'amount' => $withdrawal->amount,
                ],
            ]);

            return back()->with('success', 'Retiro aprobado exitosamente.');
        });
    }

    /**
     * Admin rejects a withdrawal.
     */
    public function reject(Request $request, $id)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $withdrawal = Withdrawal::with('tutorProfile')->findOrFail($id);

        if (!$withdrawal->isPending()) {
            return back()->withErrors(['error' => 'Esta solicitud ya ha sido procesada.']);
        }

        $withdrawal->update([
            'status' => 'rejected',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'admin_notes' => $validated['admin_notes'],
        ]);

        // Notify tutor with reason
        $tutorId = $withdrawal->tutorProfile->user_id;

        Notification::create([
            'user_id' => $tutorId,
            'title' => 'Retiro rechazado',
            'message' => "Tu solicitud de retiro de {$withdrawal->amount} tokens ha sido rechazada. Motivo: {$validated['admin_notes']}",
            'type' => 'withdrawal_rejected',
            'data' => [
                'withdrawal_id' => $withdrawal->id,
                'amount' => $withdrawal->amount,
                'reason' => $validated['admin_notes'],
            ],
        ]);

        return back()->with('success', 'Retiro rechazado exitosamente.');
    }

    /**
     * Get the tutor's available earnings balance from session_payment transactions.
     */
    private function getTutorEarningsBalance(int $tutorProfileId): int
    {
        $tutorProfile = TutorProfile::find($tutorProfileId);
        if (!$tutorProfile) {
            return 0;
        }

        return $this->getUserTokenBalance($tutorProfile->user_id);
    }

    /**
     * Get a user's current token balance.
     */
    private function getUserTokenBalance(int $userId): int
    {
        $latestToken = Token::where('user_id', $userId)->latest()->first();
        return $latestToken ? $latestToken->tokens_after : 0;
    }
}

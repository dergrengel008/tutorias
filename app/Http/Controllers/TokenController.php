<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Token;
use App\Models\PaymentReceipt;
use App\Models\Notification;
use App\Models\User;

class TokenController extends Controller
{
    /**
     * Muestra la página de tokens del estudiante con su saldo,
     * paquetes disponibles, recibos pendientes e historial de transacciones.
     */
    public function index()
    {
        $transactions = Token::where('user_id', Auth::id())
            ->latest()
            ->paginate(20);

        $currentBalance = $this->getBalance();

        $pendingReceipts = PaymentReceipt::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->latest()
            ->get();

        $recentReceipts = PaymentReceipt::where('user_id', Auth::id())
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Tokens/Index', [
            'transactions'    => $transactions,
            'currentBalance'  => $currentBalance,
            'pendingReceipts' => $pendingReceipts,
            'recentReceipts'  => $recentReceipts,
            'packages'        => [
                ['tokens' => 10, 'price' => 5, 'bonus' => 0],
                ['tokens' => 25, 'price' => 10, 'bonus' => 2],
                ['tokens' => 50, 'price' => 18, 'bonus' => 5],
                ['tokens' => 100, 'price' => 30, 'bonus' => 15],
            ],
        ]);
    }

    /**
     * Procesa la solicitud de compra de tokens vía Pago Móvil.
     * El estudiante sube la captura del comprobante y queda en estado "pending"
     * hasta que un admin lo apruebe.
     */
    public function requestTopUp(Request $request)
    {
        $validated = $request->validate([
            'tokens_requested' => 'required|integer|min:1|max:10000',
            'amount_paid'       => 'required|numeric|min:0.01',
            'currency'          => 'required|in:USD,VES',
            'bank_name'         => 'required|string|max:255',
            'phone_number'      => 'required|string|max:50',
            'reference_number'  => 'required|string|max:100',
            'receipt_image'     => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // max 5MB
        ]);

        // Verificar que el estudiante no tenga recibos pendientes excesivos (máximo 5)
        $pendingCount = PaymentReceipt::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->count();

        if ($pendingCount >= 5) {
            return redirect()->back()
                ->withErrors(['receipt_image' => 'Tienes demasiadas solicitudes pendientes. Espera a que sean revisadas antes de enviar otra.'])
                ->withInput();
        }

        // Guardar imagen del comprobante
        $imagePath = $request->file('receipt_image')->store('receipts', 'public');

        $receipt = PaymentReceipt::create([
            'user_id'          => Auth::id(),
            'tokens_requested' => $validated['tokens_requested'],
            'amount_paid'      => $validated['amount_paid'],
            'currency'         => $validated['currency'],
            'bank_name'        => $validated['bank_name'],
            'phone_number'     => $validated['phone_number'],
            'reference_number' => $validated['reference_number'],
            'receipt_image_path' => $imagePath,
            'status'           => 'pending',
        ]);

        // Notificar a todos los admins sobre la nueva solicitud de recarga
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id'  => $admin->id,
                'title'    => 'Nueva solicitud de recarga',
                'message'  => "El estudiante {$request->user()->name} ha solicitado una recarga de {$validated['tokens_requested']} tokens ({$validated['amount_paid']} {$validated['currency']}).",
                'type'     => 'payment_pending',
                'data'     => [
                    'receipt_id'      => $receipt->id,
                    'student_name'    => $request->user()->name,
                    'tokens_requested' => $validated['tokens_requested'],
                    'amount_paid'     => $validated['amount_paid'],
                    'currency'        => $validated['currency'],
                ],
            ]);
        }

        return redirect()->back()->with('success', '¡Solicitud enviada! Tu comprobante de pago está siendo revisado. Recibirás una notificación cuando sea aprobado.');
    }

    /**
     * Obtiene el balance actual de tokens del usuario autenticado.
     */
    public function getBalance()
    {
        $latestToken = Token::where('user_id', Auth::id())->latest('id')->first();
        $balance = $latestToken ? $latestToken->tokens_after : 0;
        return response()->json(['balance' => $balance]);
    }

    /**
     * [ADMIN] Aprueba un recibo de pago y acredita los tokens al estudiante.
     */
    public function approveReceipt(Request $request, $id)
    {
        $receipt = PaymentReceipt::findOrFail($id);

        if ($receipt->status !== 'pending') {
            return redirect()->back()->with('error', 'Este recibo ya fue procesado.');
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($receipt, $validated) {
            $receipt->update([
                'status'      => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => Auth::id(),
                'admin_notes' => $validated['admin_notes'] ?? null,
            ]);

            $userId = $receipt->user_id;
            $quantity = $receipt->tokens_requested;

            $latestToken = Token::where('user_id', $userId)->lockForUpdate()->latest()->first();
            $tokensBefore = $latestToken ? $latestToken->tokens_after : 0;
            $tokensAfter = $tokensBefore + $quantity;

            Token::create([
                'user_id'          => $userId,
                'quantity'         => $quantity,
                'transaction_type' => 'purchase',
                'amount'           => $receipt->amount_paid,
                'tokens_before'    => $tokensBefore,
                'tokens_after'     => $tokensAfter,
                'description'      => "Recarga aprobada vía Pago Móvil - {$quantity} tokens (Ref: {$receipt->reference_number})",
                'reference'        => 'pm_' . $receipt->reference_number . '_' . $receipt->id,
            ]);

            // Notificar al estudiante
            Notification::create([
                'user_id'  => $userId,
                'title'    => '¡Recarga aprobada!',
                'message'  => "Tu recarga de {$quantity} tokens ha sido aprobada. Tu nuevo saldo es de {$tokensAfter} tokens.",
                'type'     => 'tokens_received',
                'data'     => [
                    'quantity'    => $quantity,
                    'new_balance' => $tokensAfter,
                ],
            ]);
        });

        $quantity = $receipt->tokens_requested;
        return redirect()->back()->with('success', "Recibo aprobado. Se acreditaron {$quantity} tokens al estudiante.");
    }

    /**
     * [ADMIN] Rechaza un recibo de pago.
     */
    public function rejectReceipt(Request $request, $id)
    {
        $receipt = PaymentReceipt::findOrFail($id);

        if ($receipt->status !== 'pending') {
            return redirect()->back()->with('error', 'Este recibo ya fue procesado.');
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $receipt->update([
            'status'      => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
            'admin_notes' => $validated['admin_notes'],
        ]);

        // Notificar al estudiante
        Notification::create([
            'user_id'  => $receipt->user_id,
            'title'    => 'Recarga rechazada',
            'message'  => "Tu recarga de {$receipt->tokens_requested} tokens ha sido rechazada. Motivo: {$validated['admin_notes']}. Puedes enviar un nuevo comprobante si lo deseas.",
            'type'     => 'payment_rejected',
            'data'     => [
                'receipt_id'      => $receipt->id,
                'tokens_requested' => $receipt->tokens_requested,
            ],
        ]);

        return redirect()->back()->with('success', 'Recibo rechazado. Se notificó al estudiante.');
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;

class ForgotPasswordController extends Controller
{
    /**
     * Show the form to request a password reset link.
     */
    public function showForgotForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Send a password reset link to the given user.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No encontramos una cuenta con ese correo electrónico.',
        ]);

        $email = $request->input('email');
        $token = Str::random(60);

        // Store the token in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // For now, flash a success message (email sending requires SMTP config)
        // In production, you would send an email with the reset link:
        // Mail::to($email)->send(new ResetPasswordMail($token, $email));
        // The reset link would be: route('password.reset', ['token' => $token, 'email' => $email])

        return back()->with('success', 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.');
    }

    /**
     * Show the password reset form.
     */
    public function showResetForm(Request $request, string $token)
    {
        $email = $request->query('email');

        if (! $email) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Se requiere el correo electrónico para restablecer la contraseña.']);
        }

        // Verify the token exists (we store hashed, so we verify the record exists by email)
        $resetRecord = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $resetRecord) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'No se encontró una solicitud de restablecimiento para ese correo.']);
        }

        // Check if the token is not expired (60 minutes)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return redirect()->route('password.request')
                ->withErrors(['email' => 'El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.']);
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email,
        ]);
    }

    /**
     * Reset the given user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email|exists:users,email',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ]);

        $email = $request->input('email');
        $token = $request->input('token');

        // Look up the reset record
        $resetRecord = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $resetRecord) {
            return back()->withErrors(['email' => 'No se encontró una solicitud de restablecimiento válida.']);
        }

        // Check if the token is not expired (60 minutes)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return back()->withErrors(['email' => 'El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.']);
        }

        // Verify the token against the hashed version
        // Note: since we hash the token, we use Hash::check
        if (! Hash::check($token, $resetRecord->token)) {
            return back()->withErrors(['token' => 'El token de restablecimiento no es válido.']);
        }

        // Update user password
        $user = User::where('email', $email)->first();
        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        // Delete the reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return redirect()->route('login')
            ->with('success', 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.');
    }
}

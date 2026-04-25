<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    /**
     * Show the forgot password form.
     */
    public function showForgotForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Send a password reset link to the given email address.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->email;

        // Prevent email enumeration: always return success
        // Only actually send if user exists
        $userExists = DB::table('users')->where('email', $email)->exists();

        if ($userExists) {
            // Rate limit: max 3 per hour per email
            $recentCount = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('created_at', '>=', now()->subHour())
                ->count();

            if ($recentCount >= 3) {
                return response()->json([
                    'message' => 'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.',
                ], 429);
            }

            $token = Str::random(64);

            // Delete any existing token for this email
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            // Store the hashed token
            DB::table('password_reset_tokens')->insert([
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send the reset email
            Mail::to($email)->send(new ResetPasswordMail($token, $email));
        }

        return response()->json([
            'message' => 'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.',
        ]);
    }

    /**
     * Show the reset password form.
     */
    public function showResetForm(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $resetRecord) {
            return back()->withErrors(['email' => 'Token de restablecimiento inválido.']);
        }

        // Verify the token
        if (! Hash::check($request->token, $resetRecord->token)) {
            return back()->withErrors(['token' => 'Token de restablecimiento inválido.']);
        }

        // Check token expiration (60 minutes)
        if ($resetRecord->created_at->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return back()->withErrors(['token' => 'El enlace de restablecimiento ha expirado.']);
        }

        // Update the user's password
        $user = DB::table('users')->where('email', $request->email)->first();

        if (! $user) {
            return back()->withErrors(['email' => 'No se encontró una cuenta con ese correo electrónico.']);
        }

        DB::table('users')
            ->where('email', $request->email)
            ->update([
                'password' => Hash::make($request->password),
                'updated_at' => now(),
            ]);

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return redirect()->route('login')->with('success', 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.');
    }
}

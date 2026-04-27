<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function showForgotForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $request->email;
        $userExists = DB::table('users')->where('email', $email)->exists();

        if ($userExists) {
            $recentCount = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('created_at', '>=', now()->subHour())
                ->count();

            if ($recentCount >= 3) {
                return response()->json([
                    'message' => 'Si el correo electronico esta registrado, recibiras un enlace para restablecer tu contrasena.',
                ], 429);
            }

            $token = Str::random(64);
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            DB::table('password_reset_tokens')->insert([
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);
            Mail::to($email)->send(new ResetPasswordMail($token, $email));
        }

        return response()->json([
            'message' => 'Si el correo electronico esta registrado, recibiras un enlace para restablecer tu contrasena.',
        ]);
    }

    public function showResetForm(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

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
            return back()->withErrors(['email' => 'Token de restablecimiento invalido.']);
        }

        if (! Hash::check($request->token, $resetRecord->token)) {
            return back()->withErrors(['token' => 'Token de restablecimiento invalido.']);
        }

        // Fix: Parse string to Carbon before calling diffInMinutes
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return back()->withErrors(['token' => 'El enlace de restablecimiento ha expirado.']);
        }

        $user = DB::table('users')->where('email', $request->email)->first();

        if (! $user) {
            return back()->withErrors(['email' => 'No se encontro una cuenta con ese correo electronico.']);
        }

        DB::table('users')
            ->where('email', $request->email)
            ->update([
                'password' => Hash::make($request->password),
                'updated_at' => now(),
            ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return redirect()->route('login')->with('success', 'Tu contrasena ha sido restablecida correctamente.');
    }
}

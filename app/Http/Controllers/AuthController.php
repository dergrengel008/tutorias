<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function login(Request $request)
    {
        $throttleKey = strtolower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en {$seconds} segundos.",
            ])->onlyInput('email');
        }

        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($throttleKey, 60); // Lock for 60 seconds
            return back()->withErrors([
                'email' => 'Las credenciales proporcionadas no coinciden con nuestros registros.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        RateLimiter::clear($throttleKey);

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return back()->withErrors([
                'email' => 'Tu cuenta ha sido desactivada. Contacta al administrador.',
            ])->onlyInput('email');
        }

        return match ($user->role) {
            'admin'   => redirect()->intended(route('admin.dashboard')),
            'tutor'   => redirect()->intended(route('tutor.dashboard')),
            'student' => redirect()->intended(route('student.dashboard')),
            default   => redirect()->intended('/'),
        };
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email',
            'password'        => 'required|string|min:8|confirmed',
            'role'            => 'required|in:student,tutor',
            'phone'           => 'nullable|string|max:20',
            'city'            => 'nullable|string|max:100',
            'country'         => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
            'phone'    => $validated['phone'] ?? null,
            'city'     => $validated['city'] ?? null,
            'country'  => $validated['country'] ?? null,
            'is_active' => true,
        ]);

        // Create empty profile based on role
        match ($user->role) {
            'tutor'   => TutorProfile::create([
                'user_id'          => $user->id,
                'status'           => 'pending',
                'is_approved'      => false,
                'average_rating'   => 0,
                'total_sessions'   => 0,
                'total_warnings'   => 0,
            ]),
            'student' => StudentProfile::create([
                'user_id'               => $user->id,
                'total_sessions_completed' => 0,
            ]),
            default   => null,
        };

        Auth::login($user);

        $request->session()->flash('success', '¡Cuenta creada exitosamente! Bienvenido/a a Tutoria.');

        return match ($user->role) {
            'tutor'   => redirect()->route('tutor.dashboard'),
            'student' => redirect()->route('student.dashboard'),
            default   => redirect('/'),
        };
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    // ─── Mobile API Auth Methods ──────────────────────────────────────

    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'string',
        ]);

        if (!auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        $user = auth()->user();

        if (!$user->is_active) {
            auth()->logout();
            return response()->json([
                'message' => 'Tu cuenta ha sido desactivada.',
            ], 403);
        }

        $token = $user->createToken($request->device_name ?? 'mobile')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,tutor',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
            'phone'    => $validated['phone'] ?? null,
            'city'     => $validated['city'] ?? null,
            'country'  => $validated['country'] ?? null,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        if ($validated['role'] === 'tutor') {
            $user->tutorProfile()->create([
                'status' => 'pending',
                'is_approved' => false,
            ]);
        } else {
            $user->studentProfile()->create();
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }
}

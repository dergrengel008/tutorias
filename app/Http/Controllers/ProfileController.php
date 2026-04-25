<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Upload or update the authenticated user's avatar.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'avatar.required'  => 'Debes seleccionar una imagen.',
            'avatar.image'     => 'El archivo debe ser una imagen.',
            'avatar.max'       => 'La imagen no debe superar los 2MB.',
            'avatar.mimes'     => 'El formato debe ser JPEG, PNG, JPG o WebP.',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->getRawOriginal('avatar')) {
            Storage::disk('public')->delete($user->getRawOriginal('avatar'));
        }

        $avatar = $request->file('avatar');
        $filename = 'avatars/' . $user->id . '-' . time() . '.' . $avatar->getClientOriginalExtension();

        $avatar->storeAs('public', $filename);

        $user->update([
            'avatar' => $filename,
        ]);

        return back()->with('success', 'Foto de perfil actualizada exitosamente.');
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
        ], [
            'current_password.required' => 'Debes ingresar tu contraseña actual.',
            'password.required'         => 'Debes ingresar la nueva contraseña.',
            'password.min'              => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'        => 'La confirmación de contraseña no coincide.',
        ]);

        $user = Auth::user();

        // Verify current password
        if (! Hash::check($request->input('current_password'), $user->password)) {
            return back()->withErrors([
                'current_password' => 'La contraseña actual no es correcta.',
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        // Invalidate other sessions for security (optional)
        // Auth::logoutOtherDevices($request->input('password'));

        return back()->with('success', 'Contraseña cambiada exitosamente.');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        $user = auth()->user()->load(['tutorProfile.specialties', 'studentProfile']);

        return Inertia::render('Profile/Show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio'   => ['nullable', 'string', 'max:1000'],
            'city'  => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $user->update($validated);

        if ($request->hasFile('avatar')) {
            $request->validate(['avatar' => ['image', 'max:2048']]);
            if ($user->getRawOriginal('avatar')) {
                Storage::disk('public')->delete($user->getRawOriginal('avatar'));
            }
            $user->update([
                'avatar' => $request->file('avatar')->store('avatars', 'public'),
            ]);
        }

        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }
}

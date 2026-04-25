<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PlatformSetting;

class SettingController extends Controller
{
    /**
     * Display all platform settings as a flat key-value map.
     */
    public function index()
    {
        $settings = PlatformSetting::all();
        $map = [];
        foreach ($settings as $s) {
            $map[$s->key] = $s->value;
        }

        return Inertia::render('Admin/Settings', [
            'settings' => $map,
        ]);
    }

    /**
     * Update platform settings from flat form data.
     */
    public function update(Request $request)
    {
        $allowedKeys = [
            'platform_name',
            'support_email',
            'platform_description',
            'maintenance_mode',
            'commission_rate',
            'minimum_withdrawal_tokens',
            'token_price_usd',
            'default_tokens_per_session',
            'branding_name',
            'branding_description',
        ];

        // Per-key validation rules
        $rules = [
            'platform_name'            => 'nullable|string|max:50',
            'support_email'            => 'nullable|email|max:100',
            'platform_description'     => 'nullable|string|max:500',
            'maintenance_mode'         => 'nullable|in:0,1,true,false',
            'commission_rate'          => 'nullable|numeric|min:0|max:1',
            'minimum_withdrawal_tokens'=> 'nullable|integer|min:1|max:100000',
            'token_price_usd'          => 'nullable|numeric|min:0.001|max:100',
            'default_tokens_per_session'=> 'nullable|integer|min:1|max:10000',
            'branding_name'            => 'nullable|string|max:50',
            'branding_description'     => 'nullable|string|max:500',
        ];

        $validated = $request->validate(array_intersect_key($rules, array_flip($allowedKeys)));

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                PlatformSetting::set($key, (string) $value);
            }
        }

        return redirect()->back()->with('success', 'Configuración actualizada exitosamente.');
    }
}

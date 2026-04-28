<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreWarningRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'tutor_profile_id' => ['required', 'exists:tutor_profiles,id'],
            'reason'           => ['required', 'string', 'max:1000'],
            'severity'         => ['required', 'in:low,medium,high'],
        ];
    }

    public function messages(): array
    {
        return [
            'tutor_profile_id.required' => 'Debes seleccionar un tutor.',
            'tutor_profile_id.exists'   => 'El tutor seleccionado no existe.',
            'reason.required'           => 'El motivo es obligatorio.',
            'reason.max'                => 'El motivo no puede superar los 1000 caracteres.',
            'severity.required'         => 'La severidad es obligatoria.',
            'severity.in'               => 'La severidad debe ser: low, medium o high.',
        ];
    }
}

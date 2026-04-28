<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class GiveTokensRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id'     => ['required', 'exists:users,id'],
            'quantity'    => ['required', 'integer', 'min:1', 'max:100000'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'  => 'Debes seleccionar un usuario.',
            'user_id.exists'    => 'El usuario seleccionado no existe.',
            'quantity.required' => 'La cantidad de tokens es obligatoria.',
            'quantity.min'      => 'La cantidad mínima es 1 token.',
            'quantity.max'      => 'La cantidad máxima es 100,000 tokens.',
        ];
    }
}

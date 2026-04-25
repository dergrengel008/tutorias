import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const [success, setSuccess] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => {
                setSuccess(true);
                reset('email');
            },
            onError: () => {
                setSuccess(false);
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-100 opacity-40 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                    </Link>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                        Recuperar Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm text-emerald-700 font-medium">
                            Te hemos enviado un correo con el enlace para restablecer tu contraseña.
                        </p>
                    </div>
                )}

                {/* Card */}
                {!success && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <Mail className="h-4.5 w-4.5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                        required
                                        className={`block w-full rounded-xl border bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                            errors.email
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200'
                                        }`}
                                        placeholder="tu@correo.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* General error */}
                            {errors.email === undefined && Object.keys(errors).length > 0 && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                    {Object.values(errors).map((error, i) => (
                                        <p key={i}>{String(error)}</p>
                                    ))}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar enlace de restablecimiento'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Back to login */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

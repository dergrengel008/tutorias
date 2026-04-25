import { useEffect } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';

interface ResetPasswordProps {
    email: string;
    token: string;
}

export default function ResetPassword({ email, token }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', {
            onSuccess: () => {
                router.visit('/login');
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
                        Restablecer Contraseña
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Ingresa tu nueva contraseña para continuar
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email (pre-filled, disabled) */}
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
                                    disabled
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-500 cursor-not-allowed"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Lock className="h-4.5 w-4.5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    className={`block w-full rounded-xl border bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Lock className="h-4.5 w-4.5 text-gray-400" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    className={`block w-full rounded-xl border bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                                        errors.password_confirmation
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200'
                                    }`}
                                    placeholder="Repite la contraseña"
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* General error */}
                        {errors.email && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                {errors.email}
                            </div>
                        )}
                        {errors.token && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                {errors.token}
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
                                    Restableciendo...
                                </span>
                            ) : (
                                <>
                                    Restablecer contraseña
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to login */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    <Link
                        href="/login"
                        className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                    >
                        Volver a iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

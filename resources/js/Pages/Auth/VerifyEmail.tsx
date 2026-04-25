import { useForm, usePage, Link } from '@inertiajs/react';
import { Mail, ArrowRight, LogIn } from 'lucide-react';
import { route } from '@/route';
import DefaultLayout from '@/Layouts/DefaultLayout';

export default function VerifyEmail() {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const auth = props.auth as { user: { email?: string } };

    const { post, processing } = useForm({});

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verify/resend');
    };

    return (
        <DefaultLayout>
            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
                {/* Decorative elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100 opacity-40 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-100 opacity-40 blur-3xl" />
                </div>

                <div className="relative w-full max-w-md">
                    {/* Icon */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                            Verifica tu Correo Electrónico
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Te hemos enviado un correo de verificación a <strong>{auth?.user?.email}</strong>.
                            Haz clic en el enlace que contiene para verificar tu cuenta.
                        </p>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {flash.error}
                        </div>
                    )}

                    {/* Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
                                <Mail className="h-10 w-10 text-indigo-400" />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Si no recibiste el correo, revisa tu carpeta de spam o correo no deseado.
                                También puedes solicitar que te enviemos un nuevo correo de verificación.
                            </p>

                            <form onSubmit={handleResend} className="pt-2">
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
                                        <>
                                            Reenviar correo
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Back to login link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        ¿Ya verificaste tu correo?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 inline-flex items-center gap-1"
                        >
                            <LogIn className="h-3.5 w-3.5" />
                            Iniciar Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </DefaultLayout>
    );
}

import { usePage } from '@inertiajs/react';
import { Settings, Wrench, Clock, Mail } from 'lucide-react';

interface PageProps {
    platformName?: string;
    supportEmail?: string;
}

export default function Maintenance() {
    const { props } = usePage();
    const platformName = (props.platformName as string) || 'TutoriaApp';
    const supportEmail = (props.supportEmail as string) || 'soporte@tutoriaapp.com';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 shadow-lg shadow-amber-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <Wrench className="h-8 w-8 text-amber-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Modo de Mantenimiento
                </h1>

                {/* Description */}
                <p className="text-gray-500 text-base leading-relaxed mb-8">
                    Estamos realizando mejoras en <span className="font-semibold text-gray-700">{platformName}</span>.
                    Vuelve en unos minutos, estaremos de vuelta muy pronto.
                </p>

                {/* Info card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-4">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span>Trabajando para mejorar tu experiencia</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Mail className="h-4 w-4" />
                            <span>
                                ¿Necesitas ayuda?{' '}
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    {supportEmail}
                                </a>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Settings className="h-3.5 w-3.5" />
                    <span>&copy; {new Date().getFullYear()} {platformName}. Todos los derechos reservados.</span>
                </div>
            </div>
        </div>
    );
}

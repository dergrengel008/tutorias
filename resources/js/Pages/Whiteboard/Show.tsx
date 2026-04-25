import { usePage } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Monitor, Users, Clock, MessageSquare } from 'lucide-react';

interface SessionData {
    id: number;
    title?: string;
    status?: string;
    scheduled_at?: string;
}

interface PageProps {
    session?: SessionData | null;
}

export default function WhiteboardShow({ session: rawSession }: PageProps) {
    const session = rawSession || ({} as any);

    return (
        <DefaultLayout>
            <div className="h-screen flex flex-col bg-gray-900">
                {/* Header */}
                <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <Monitor className="h-6 w-6 text-indigo-400" />
                        <h1 className="text-white font-semibold">{session.title || 'Pizarra de Tutoría'}</h1>
                        {session.status && (
                            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium capitalize">{session.status}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Sesión #{session.id || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Main Whiteboard Area */}
                <div className="flex-1 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center max-w-md">
                            <div className="h-24 w-24 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-6">
                                <Monitor className="h-12 w-12 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Pizarra Interactiva</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                La pizarra colaborativa con tldraw se integrará próximamente aquí.
                                Los tutores y estudiantes podrán dibujar, escribir y colaborar
                                en tiempo real durante las sesiones de tutoría.
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2"><Users className="h-5 w-5" /> Colaboración en vivo</div>
                                <div className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Chat integrado</div>
                                <div className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Herramientas de dibujo</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}

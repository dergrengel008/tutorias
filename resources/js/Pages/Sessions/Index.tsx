import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Calendar,
    Clock,
    Star,
    Play,
    Square,
    Eye,
    DollarSign,
    User,
    Trash,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import type { TutoringSession } from '@/types';

interface PageProps {
    sessions: TutoringSession[];
    role: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En Progreso', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

const tabFilters = [
    { key: 'all', label: 'Todas' },
    { key: 'scheduled', label: 'Programadas' },
    { key: 'in_progress', label: 'En Progreso' },
    { key: 'completed', label: 'Completadas' },
    { key: 'cancelled', label: 'Canceladas' },
];

export default function SessionsIndex({ sessions: initialSessions, role }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const sessions = (props.sessions || initialSessions) as TutoringSession[];

    const [activeTab, setActiveTab] = useState('all');

    const filteredSessions =
        activeTab === 'all'
            ? sessions
            : sessions.filter((s) => s.status === activeTab);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStartSession = (sessionId: number) => {
        if (confirm('¿Deseas iniciar esta sesión?')) {
            router.post(`/sessions/${sessionId}/start`);
        }
    };

    const handleEndSession = (sessionId: number) => {
        if (confirm('¿Deseas finalizar esta sesión?')) {
            router.post(`/sessions/${sessionId}/end`);
        }
    };

    const handleCancelSession = (sessionId: number) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta sesión? Esta acción no se puede deshacer.')) {
            router.post(`/sessions/${sessionId}/cancel`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{flash.error}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis Sesiones</h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona todas tus sesiones de tutoría
                        </p>
                    </div>
                    {role === 'student' && (
                        <a
                            href="/buscar-tutores"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Nueva Sesión
                        </a>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1.5 inline-flex gap-1 flex-wrap">
                    {tabFilters.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.key
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-70">
                                (
                                {tab.key === 'all'
                                    ? sessions.length
                                    : sessions.filter((s) => s.status === tab.key).length}
                                )
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sessions List */}
                {filteredSessions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay sesiones
                        </h3>
                        <p className="text-gray-500">
                            {activeTab === 'all'
                                ? 'Aún no tienes sesiones de tutoría'
                                : `No hay sesiones ${statusConfig[activeTab]?.label?.toLowerCase() || ''}`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredSessions.map((session) => {
                            const status = statusConfig[session.status];
                            const otherPerson =
                                role === 'tutor' ? session.student : session.tutor_profile?.user;

                            return (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                    {session.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500 truncate">
                                                        {otherPerson?.name || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ml-3 ${
                                                    status.color
                                                }`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Info Row */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                                                <Calendar className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-xs text-gray-500">Fecha</p>
                                                <p className="text-xs font-semibold text-gray-900 truncate">
                                                    {session.scheduled_at
                                                        ? formatDate(session.scheduled_at)
                                                        : '—'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                                                <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-xs text-gray-500">Duración</p>
                                                <p className="text-xs font-semibold text-gray-900">
                                                    {session.duration_minutes} min
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                                                <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                                                <p className="text-xs text-gray-500">Costo</p>
                                                <p className="text-xs font-semibold text-gray-900">
                                                    {session.tokens_cost} tokens
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                            <a
                                                href={`/sessions/${session.id}`}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Ver Detalle
                                            </a>

                                            {session.status === 'in_progress' && (
                                                <a
                                                    href={`/whiteboard/${session.id}`}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 animate-pulse"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Ir a Pizarra
                                                </a>
                                            )}

                                            {role === 'tutor' && session.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleStartSession(session.id)}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Iniciar
                                                </button>
                                            )}

                                            {role === 'tutor' && session.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleEndSession(session.id)}
                                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Square className="h-4 w-4" />
                                                    Finalizar
                                                </button>
                                            )}

                                            {session.status === 'completed' && !session.review && role === 'student' && (
                                                <a
                                                    href={`/sessions/${session.id}#review`}
                                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Star className="h-4 w-4" />
                                                    Resear
                                                </a>
                                            )}

                                            {(session.status === 'scheduled') && (
                                                <button
                                                    onClick={() => handleCancelSession(session.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

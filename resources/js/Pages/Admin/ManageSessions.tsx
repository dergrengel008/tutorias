import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Calendar,
} from 'lucide-react';
import type { TutoringSession } from '@/types';

interface PageProps {
    sessions: TutoringSession[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En Progreso', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

export default function ManageSessions({ sessions: initialSessions }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const sessions = Array.isArray(props.sessions)
        ? (props.sessions as TutoringSession[])
        : ((props.sessions?.data || initialSessions || []) as TutoringSession[]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredSessions = sessions.filter((s) => {
        const matchesSearch =
            !searchTerm ||
            s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tutor_profile?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-7 w-7 text-indigo-500" />
                        Gestionar Sesiones
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {sessions.length} sesion{sessions.length !== 1 ? 'es' : ''} registrada
                        {sessions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filtros</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por título, tutor o estudiante..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:border-indigo-500 outline-none"
                        >
                            <option value="">Todos los estados</option>
                            <option value="scheduled">Programada</option>
                            <option value="in_progress">En Progreso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        ID
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Título
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Tutor
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Estudiante
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Fecha
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Estado
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Duración
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Tokens
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-gray-400">
                                            No se encontraron sesiones
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSessions.map((session) => {
                                        const status = statusConfig[session.status];
                                        return (
                                            <tr
                                                key={session.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-500 font-mono">
                                                    #{session.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                                                        {session.title}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell truncate max-w-[150px]">
                                                    {session.tutor_profile?.user?.name || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell truncate max-w-[150px]">
                                                    {session.student?.name || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                                                    {session.scheduled_at
                                                        ? formatDate(session.scheduled_at)
                                                        : session.created_at ? formatDate(session.created_at) : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                                                        {status?.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                                                    {session.duration_minutes} min
                                                </td>
                                                <td className="py-3 px-4 text-center hidden lg:table-cell">
                                                    <span className="text-sm font-medium text-indigo-600">
                                                        {session.tokens_cost}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end">
                                                        <a
                                                            href={`/sessions/${session.id}`}
                                                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                                           
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

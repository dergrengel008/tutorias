import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Star,
    Eye,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Shield,
    GraduationCap,
} from 'lucide-react';
import type { TutorProfile } from '@/types';

interface PageProps {
    tutors: TutorProfile[];
    filters?: {
        search?: string;
        status?: string;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
    suspended: { label: 'Suspendido', color: 'bg-orange-100 text-orange-800' },
};

export default function ManageTutors({ tutors: initialTutors, filters: initialFilters }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const tutors = Array.isArray(props.tutors)
        ? (props.tutors as TutorProfile[])
        : ((props.tutors?.data || initialTutors || []) as TutorProfile[]);

    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
    const [statusFilter, setStatusFilter] = useState(initialFilters?.status || '');

    const applyFilters = () => {
        router.get('/admin/tutors', {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get('/admin/tutors', {}, { preserveState: true });
    };

    const handleAction = (tutorId: number, action: string) => {
        const confirmMessages: Record<string, string> = {
            approve: '¿Aprobar este tutor? Podrá recibir sesiones.',
            reject: '¿Rechazar este tutor?',
            suspend: '¿Suspender este tutor? No podrá recibir sesiones.',
            activate: '¿Activar este tutor?',
        };
        const reason = action === 'reject' ? prompt('Motivo del rechazo:') : null;
        if (action === 'reject' && !reason) return;

        if (confirm(confirmMessages[action] || '¿Confirmar acción?')) {
            router.post(`/admin/tutors/${tutorId}/${action}`, { reason });
        }
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="h-7 w-7 text-indigo-500" />
                            Gestionar Tutores
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {tutors.length} tutor{tutors.length !== 1 ? 'es' : ''} registrado
                            {tutors.length !== 1 ? 's' : ''}
                        </p>
                    </div>
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
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Buscar por nombre o email..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:border-indigo-500 outline-none"
                        >
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                            <option value="suspended">Suspendido</option>
                        </select>
                        <button
                            onClick={applyFilters}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Tutor
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Email
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Estado
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Calificación
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Sesiones
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Alertas
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tutors.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No se encontraron tutores
                                        </td>
                                    </tr>
                                ) : (
                                    tutors.map((tutor) => {
                                        const status = statusConfig[tutor.status];
                                        return (
                                            <tr
                                                key={tutor.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {tutor.user?.avatar ? (
                                                                <img
                                                                    src={tutor.user.avatar}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-indigo-600 font-bold">
                                                                    {tutor.user?.name?.charAt(0) || 'T'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                                {tutor.user?.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 md:hidden truncate">
                                                                {tutor.user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">
                                                    {tutor.user?.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                                                        {status?.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center hidden sm:table-cell">
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {typeof tutor.average_rating === 'number' && tutor.average_rating > 0
                                                                ? tutor.average_rating.toFixed(1)
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-sm text-gray-600 hidden lg:table-cell">
                                                    {tutor.total_sessions}
                                                </td>
                                                <td className="py-3 px-4 text-center hidden lg:table-cell">
                                                    {tutor.total_warnings > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            {tutor.total_warnings}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">0</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={`/tutors/${tutor.id}`}
                                                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                                           
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                        {tutor.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(tutor.id, 'approve')}
                                                                    className="h-8 w-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors"
                                                                   
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(tutor.id, 'reject')}
                                                                    className="h-8 w-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
                                                                   
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {(tutor.status === 'approved' || tutor.status === 'rejected') && (
                                                            <button
                                                                onClick={() => handleAction(tutor.id, 'suspend')}
                                                                className="h-8 w-8 rounded-lg bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                                                               
                                                            >
                                                                <Shield className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {tutor.status === 'suspended' && (
                                                            <button
                                                                onClick={() => handleAction(tutor.id, 'activate')}
                                                                className="h-8 w-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors"
                                                               
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
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



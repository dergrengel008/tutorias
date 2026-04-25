import { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    BookOpen,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Filter,
    Eye,
    X,
    GraduationCap,
    Star,
    Coins,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface ThesisReview {
    id: number;
    title: string;
    student?: {
        id: number;
        name: string;
    };
    tutor_profile?: {
        id: number;
        user?: {
            id: number;
            name: string;
        };
    };
    academic_level: string;
    status: string;
    tokens_cost: string | number;
    current_round: number;
    max_rounds: number;
    created_at: string;
    updated_at?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse {
    data: ThesisReview[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links?: PaginationLink[];
}

interface PageProps {
    reviews?: PaginatedResponse | ThesisReview[];
    filters?: {
        status?: string;
    };
    stats?: {
        total: number;
        pending: number;
        in_review: number;
        needs_revision: number;
        completed: number;
        cancelled: number;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800' },
    in_review: { label: 'En Revisión', color: 'bg-green-100 text-green-800' },
    needs_revision: { label: 'Necesita Revisión', color: 'bg-amber-100 text-amber-800' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

const academicLevelLabels: Record<string, string> = {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

const statusFilters = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'in_review', label: 'En Revisión' },
    { value: 'needs_revision', label: 'Necesita Revisión' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
];

export default function AdminThesisIndex({
    reviews: rawReviews,
    filters: rawFilters,
    stats: rawStats,
}: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const reviews: ThesisReview[] = Array.isArray(rawReviews)
        ? rawReviews
        : (rawReviews as PaginatedResponse)?.data || [];

    const pagination: PaginatedResponse | null = !Array.isArray(rawReviews) && rawReviews
        ? (rawReviews as PaginatedResponse)
        : null;

    const currentStatus = rawFilters?.status || 'all';

    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const stats = rawStats || {
        total: pagination?.total || reviews.length,
        pending: 0,
        in_review: 0,
        needs_revision: 0,
        completed: 0,
        cancelled: 0,
    };

    const handleFilterChange = (status: string) => {
        router.get('/admin/thesis', { status }, { preserveState: false });
    };

    const openCancelModal = (id: number) => {
        setCancellingId(id);
    };

    const closeCancelModal = () => {
        setCancellingId(null);
    };

    const handleCancel = () => {
        if (cancellingId !== null) {
            router.post(`/admin/thesis/${cancellingId}/cancel`);
            closeCancelModal();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const statusBadge = (status: string) => {
        const config = statusConfig[status];
        if (!config) {
            return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>
            );
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const academicLevelBadge = (level: string) => {
        const labels: Record<string, { label: string; color: string }> = {
            pregrado: { label: 'Pregrado', color: 'bg-blue-50 text-blue-700' },
            maestria: { label: 'Maestría', color: 'bg-purple-50 text-purple-700' },
            doctorado: { label: 'Doctorado', color: 'bg-emerald-50 text-emerald-700' },
        };
        const config = labels[level] || { label: academicLevelLabels[level] || level, color: 'bg-gray-50 text-gray-700' };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <GraduationCap className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    const roundInfo = (current: number, max: number) => {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Star className="h-3 w-3 text-amber-500" />
                Ronda {current} de {max}
            </span>
        );
    };

    const total = pagination?.total || stats.total || reviews.length;

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-indigo-500" />
                            Revisiones de Tesis
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona todas las revisiones de tesis del sistema
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-800">
                            {total} revisión{total !== 1 ? 'es' : ''} en total
                        </span>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats.total > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">Total</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
                            <p className="text-xs font-medium text-blue-600 mt-1">Pendientes</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-700">{stats.in_review}</p>
                            <p className="text-xs font-medium text-green-600 mt-1">En Revisión</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-amber-700">{stats.needs_revision}</p>
                            <p className="text-xs font-medium text-amber-600 mt-1">Necesita Revisión</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-gray-700">{stats.completed}</p>
                            <p className="text-xs font-medium text-gray-600 mt-1">Completadas</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                            <p className="text-xs font-medium text-red-600 mt-1">Canceladas</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => handleFilterChange(filter.value)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        currentStatus === filter.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        {pagination && (
                            <span className="ml-auto text-xs text-gray-400">
                                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Estudiante
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Tutor
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Nivel Académico
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Tokens
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Ronda
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                                        Fecha
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reviews.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-12">
                                            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Sin revisiones de tesis</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {currentStatus !== 'all'
                                                    ? `No hay revisiones con estado "${statusConfig[currentStatus]?.label || currentStatus}"`
                                                    : 'No hay revisiones de tesis registradas'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.map((review) => (
                                        <tr
                                            key={review.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                                                #{review.id}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                        <FileText className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 truncate max-w-[200px]">
                                                        {review.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 hidden md:table-cell truncate max-w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-blue-600">
                                                            {review.student?.name?.charAt(0) || 'E'}
                                                        </span>
                                                    </div>
                                                    <span className="truncate">
                                                        {review.student?.name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 hidden md:table-cell truncate max-w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-emerald-600">
                                                            {review.tutor_profile?.user?.name?.charAt(0) || 'T'}
                                                        </span>
                                                    </div>
                                                    <span className="truncate">
                                                        {review.tutor_profile?.user?.name || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                {academicLevelBadge(review.academic_level)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {statusBadge(review.status)}
                                            </td>
                                            <td className="py-3 px-4 text-right hidden sm:table-cell">
                                                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
                                                    <Coins className="h-3.5 w-3.5" />
                                                    {Number(review.tokens_cost).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                                                {roundInfo(review.current_round, review.max_rounds)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap hidden xl:table-cell">
                                                {formatDate(review.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span
                                                        className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"
                                                        title="ID: #{review.id}"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </span>
                                                    {(review.status === 'pending' || review.status === 'in_review' || review.status === 'needs_revision') && (
                                                        <button
                                                            onClick={() => openCancelModal(review.id)}
                                                            className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                                                            title="Cancelar revisión"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Mostrando {pagination.from}–{pagination.to} de {pagination.total}
                            </p>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={pagination.prev_page_url || '#'}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        pagination.prev_page_url
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Link>
                                {pagination.links
                                    ?.filter(
                                        (l) =>
                                            l.label !== '&laquo; Previous' &&
                                            l.label !== 'Next &raquo;'
                                    )
                                    .map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                <Link
                                    href={pagination.next_page_url || '#'}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        pagination.next_page_url
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {cancellingId !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Cancelar Revisión
                            </h2>
                            <button
                                onClick={closeCancelModal}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-4 bg-red-50 rounded-lg p-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-700">
                                ¿Estás seguro de que deseas cancelar esta revisión de tesis? Se notificará al estudiante y al tutor. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeCancelModal}
                                className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancel}
                                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Confirmar Cancelación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Star,
    BookOpen,
    GraduationCap,
    Eye,
    Filter,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    avatar?: string;
}

interface ThesisReviewItem {
    id: number;
    title: string;
    academic_level: 'pregrado' | 'maestria' | 'doctorado';
    status: 'pending' | 'in_review' | 'needs_revision' | 'completed';
    current_round: number;
    max_rounds: number;
    deadline?: string;
    tutor_earned_tokens: number;
    tokens_cost: number;
    student?: Student;
    original_filename?: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedReviews {
    data: ThesisReviewItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links?: PaginationLink[];
}

interface PageProps {
    reviews?: PaginatedReviews | ThesisReviewItem[];
    completedCount?: number;
}

const FILTERS = ['all', 'pending', 'in_review', 'needs_revision'] as const;
const FILTER_LABELS: Record<string, string> = {
    all: 'Todas',
    pending: 'Pendientes',
    in_review: 'En Revisión',
    needs_revision: 'Necesita Corrección',
};

const LEVEL_LABELS: Record<string, string> = {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

const LEVEL_COLORS: Record<string, string> = {
    pregrado: 'bg-blue-50 text-blue-700',
    maestria: 'bg-purple-50 text-purple-700',
    doctorado: 'bg-emerald-50 text-emerald-700',
};

export default function TutorThesisIndex({ reviews: rawReviews, completedCount = 0 }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const isPaginated = !Array.isArray(rawReviews) && rawReviews;
    const allReviews: ThesisReviewItem[] = Array.isArray(rawReviews)
        ? rawReviews
        : (rawReviews as PaginatedReviews)?.data || [];

    const pagination = isPaginated ? (rawReviews as PaginatedReviews) : null;

    const [filter, setFilter] = useState<string>('all');

    const filtered = filter === 'all' ? allReviews : allReviews.filter((r) => r.status === filter);

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-blue-100 text-blue-800',
            in_review: 'bg-green-100 text-green-800',
            needs_revision: 'bg-amber-100 text-amber-800',
            completed: 'bg-gray-100 text-gray-800',
        };
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            in_review: 'En Revisión',
            needs_revision: 'Necesita Corrección',
            completed: 'Completada',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    const formatDeadline = (dateStr: string) => {
        const deadline = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;
        const isUrgent = diffDays >= 0 && diffDays <= 2;
        return {
            formatted: deadline.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            isOverdue,
            isUrgent,
            diffDays,
        };
    };

    const statCards = [
        {
            label: 'Revisiones Activas',
            value: allReviews.length,
            icon: FileText,
            color: 'bg-blue-50 text-blue-700',
        },
        {
            label: 'Pendientes',
            value: allReviews.filter((r) => r.status === 'pending').length,
            icon: Clock,
            color: 'bg-amber-50 text-amber-700',
        },
        {
            label: 'En Revisión',
            value: allReviews.filter((r) => r.status === 'in_review').length,
            icon: RefreshCw,
            color: 'bg-green-50 text-green-700',
        },
        {
            label: 'Completadas',
            value: completedCount,
            icon: CheckCircle,
            color: 'bg-gray-50 text-gray-700',
        },
    ];

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="h-7 w-7 text-indigo-500" />
                        Revisiones de Tesis
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {pagination
                            ? `${pagination.total} revisión${pagination.total !== 1 ? 'es' : ''} activa${pagination.total !== 1 ? 's' : ''}`
                            : `${allReviews.length} revisión${allReviews.length !== 1 ? 'es' : ''} activa${allReviews.length !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div
                                className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}
                            >
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400" />
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    filter === f
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {FILTER_LABELS[f]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin revisiones</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? 'No tienes revisiones de tesis activas.'
                                : `No hay revisiones "${FILTER_LABELS[filter].toLowerCase()}".`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((review) => {
                            const deadlineInfo = review.deadline ? formatDeadline(review.deadline) : null;

                            return (
                                <div
                                    key={review.id}
                                    className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Icon */}
                                        <div
                                            className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                                                review.status === 'pending'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : review.status === 'in_review'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-amber-100 text-amber-600'
                                            }`}
                                        >
                                            {review.status === 'pending' ? (
                                                <Clock className="h-6 w-6" />
                                            ) : review.status === 'in_review' ? (
                                                <RefreshCw className="h-6 w-6" />
                                            ) : (
                                                <AlertTriangle className="h-6 w-6" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{review.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-sm text-gray-500">
                                                    {review.student?.name || 'Estudiante'}
                                                </span>
                                                <span className="text-gray-300">·</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${LEVEL_COLORS[review.academic_level]}`}>
                                                    <GraduationCap className="h-3 w-3 mr-1" />
                                                    {LEVEL_LABELS[review.academic_level] || review.academic_level}
                                                </span>
                                                <span className="text-gray-300">·</span>
                                                <span className="text-xs text-gray-400">
                                                    Ronda {review.current_round}/{review.max_rounds}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                                {deadlineInfo && (
                                                    <span
                                                        className={`flex items-center gap-1 ${
                                                            deadlineInfo.isOverdue
                                                                ? 'text-red-500 font-medium'
                                                                : deadlineInfo.isUrgent
                                                                ? 'text-amber-500 font-medium'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        <Clock className="h-3 w-3" />
                                                        {deadlineInfo.isOverdue
                                                            ? `Vencida hace ${Math.abs(deadlineInfo.diffDays)}d`
                                                            : deadlineInfo.diffDays === 0
                                                            ? 'Vence hoy'
                                                            : `Vence ${deadlineInfo.formatted}`}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    <Star className="h-3 w-3" />
                                                    +{review.tutor_earned_tokens} tokens
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {statusBadge(review.status)}
                                            <Link
                                                href={`/tutor/thesis/${review.id}`}
                                                className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination && pagination.last_page > 1 && filter === 'all' && (
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <div className="flex items-center justify-between">
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
                                    ?.filter((l) => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;')
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
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

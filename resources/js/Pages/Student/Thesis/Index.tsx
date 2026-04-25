import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Star,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar,
    GraduationCap,
    Coins,
    Eye,
    Filter,
} from 'lucide-react';

interface ThesisReview {
    id: number;
    title: string;
    status: 'pending' | 'in_review' | 'needs_revision' | 'completed' | 'cancelled';
    academic_level: string;
    tutor_profile?: { id: number; user?: { name: string } };
    current_round: number;
    max_rounds: number;
    tokens_cost: number;
    created_at: string;
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
    links: PaginationLink[];
}

interface PageProps {
    reviews: PaginatedResponse;
}

const FILTERS = ['all', 'pending', 'in_review', 'needs_revision', 'completed', 'cancelled'] as const;
const FILTER_LABELS: Record<string, string> = {
    all: 'Todas',
    pending: 'Pendiente',
    in_review: 'En Revisión',
    needs_revision: 'Requiere Revisión',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800', icon: Clock },
    in_review: { label: 'En Revisión', color: 'bg-green-100 text-green-800', icon: Eye },
    needs_revision: { label: 'Requiere Revisión', color: 'bg-amber-100 text-amber-800', icon: Star },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const LEVEL_LABELS: Record<string, string> = {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

export default function ThesisIndex({ reviews }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const [filter, setFilter] = useState<string>('all');

    const reviewsData = reviews?.data || [];
    const filtered = filter === 'all' ? reviewsData : reviewsData.filter((r: ThesisReview) => r.status === filter);

    const currentPage = reviews?.current_page || 1;
    const lastPage = reviews?.last_page || 1;
    const totalPages = reviews?.total || 0;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const handlePageChange = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-indigo-500" />
                            Revisiones de Tesis
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {totalPages} revisión{totalPages !== 1 ? 'es' : ''} en total
                        </p>
                    </div>
                    <Link
                        href="/student/thesis/create"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-md shadow-indigo-200"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Revisión
                    </Link>
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
                                    filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin revisiones</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === 'all'
                                ? 'Aún no has solicitado revisiones de tesis.'
                                : `No hay revisiones "${FILTER_LABELS[filter].toLowerCase()}".`}
                        </p>
                        {filter === 'all' && (
                            <Link
                                href="/student/thesis/create"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Solicitar Revisión
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {filtered.map((review: ThesisReview) => {
                                const statusCfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;
                                const StatusIcon = statusCfg.icon;
                                return (
                                    <div
                                        key={review.id}
                                        className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{review.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {review.tutor_profile?.user?.name || 'Tutor'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {LEVEL_LABELS[review.academic_level] || review.academic_level}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3" />
                                                        Ronda {review.current_round}/{review.max_rounds}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Coins className="h-3 w-3" />
                                                        {review.tokens_cost} tokens
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(review.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                                <Link
                                                    href={`/student/thesis/${review.id}`}
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

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Página {currentPage} de {lastPage}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {reviews?.links?.map((link: PaginationLink, index: number) => {
                                            if (!link.url) return null;
                                            const isPrev =
                                                link.label === '&laquo; Previous' ||
                                                link.label.includes('Anterior') ||
                                                link.label.includes('Previous') ||
                                                link.label.includes('«');
                                            const isNext =
                                                link.label === 'Next &raquo;' ||
                                                link.label.includes('Siguiente') ||
                                                link.label.includes('Next') ||
                                                link.label.includes('»');

                                            if (index === 0 || index === reviews.links.length - 1) {
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(link.url!)}
                                                        disabled={currentPage === (isPrev ? 1 : lastPage)}
                                                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === (isPrev ? 1 : lastPage)
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-700 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700'
                                                        }`}
                                                    >
                                                        {isPrev ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handlePageChange(link.url!)}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'text-gray-700 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700'
                                                    }`}
                                                >
                                                    {link.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

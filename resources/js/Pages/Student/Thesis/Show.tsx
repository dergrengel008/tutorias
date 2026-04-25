import { useState, useRef } from 'react';
import { usePage, useForm, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    FileText,
    Upload,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Star,
    BookOpen,
    MessageSquare,
    ChevronRight,
    ArrowLeft,
    AlertTriangle,
    Send,
    RefreshCw,
    Plus,
    Calendar,
    GraduationCap,
    Coins,
    Eye,
} from 'lucide-react';

interface FeedbackRound {
    id: number;
    round_number: number;
    general_comments: string;
    section_ratings: {
        structure: number;
        content: number;
        methodology: number;
        writing: number;
        references: number;
    };
    annotated_file_url?: string;
    created_at: string;
}

interface ThesisReview {
    id: number;
    title: string;
    status: 'pending' | 'in_review' | 'needs_revision' | 'completed' | 'cancelled';
    academic_level: string;
    subject_area?: string;
    instructions?: string;
    current_round: number;
    max_rounds: number;
    tokens_cost: number;
    final_rating?: number | null;
    original_file_url?: string;
    tutor_profile?: { id: number; user?: { name: string; avatar?: string } };
    feedback_rounds: FeedbackRound[];
    created_at: string;
    updated_at?: string;
}

interface PageProps {
    review: ThesisReview;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800', bgColor: 'from-blue-600 to-blue-700' },
    in_review: { label: 'En Revisión', color: 'bg-green-100 text-green-800', bgColor: 'from-green-600 to-green-700' },
    needs_revision: { label: 'Requiere Revisión', color: 'bg-amber-100 text-amber-800', bgColor: 'from-amber-600 to-amber-700' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', bgColor: 'from-gray-600 to-gray-700' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', bgColor: 'from-red-600 to-red-700' },
};

const LEVEL_LABELS: Record<string, string> = {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

const RATING_LABELS: Record<string, string> = {
    structure: 'Estructura',
    content: 'Contenido',
    methodology: 'Metodología',
    writing: 'Redacción',
    references: 'Referencias',
};

export default function ThesisShow({ review }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const statusCfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;

    const canRequestRevision =
        (review.status === 'completed' || review.status === 'needs_revision') &&
        review.current_round < review.max_rounds;

    const canRate = review.status === 'completed' && !review.final_rating;

    const { data: revisionData, setData: setRevisionData, post: postRevision, processing: revisionProcessing, errors: revisionErrors, reset: resetRevision } = useForm({
        revision_notes: '',
        file: null as File | null,
    });

    const { data: ratingData, setData: setRatingData, post: postRating, processing: ratingProcessing, errors: ratingErrors, reset: resetRating } = useForm({
        rating: 0,
    });

    const [hoverRating, setHoverRating] = useState(0);
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [revisionFileName, setRevisionFileName] = useState('');
    const revisionFileRef = useRef<HTMLInputElement>(null);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const handleCancel = () => {
        if (confirm('¿Estás seguro de que deseas cancelar esta revisión? Se te reembolsarán los tokens.')) {
            router.post(`/student/thesis/${review.id}/cancel`);
        }
    };

    const handleRevisionFileChange = (file: File | null) => {
        if (file) {
            setRevisionData('file', file);
            setRevisionFileName(file.name);
        } else {
            setRevisionData('file', null);
            setRevisionFileName('');
        }
    };

    const handleRequestRevision = (e: React.FormEvent) => {
        e.preventDefault();
        postRevision(`/student/thesis/${review.id}/request-revision`, {
            forceFormData: true,
            onSuccess: () => {
                resetRevision();
                setRevisionFileName('');
                setShowRevisionForm(false);
                if (revisionFileRef.current) revisionFileRef.current.value = '';
            },
        });
    };

    const handleSubmitRating = (e: React.FormEvent) => {
        e.preventDefault();
        postRating(`/student/thesis/${review.id}/rate`, {
            onSuccess: () => {
                resetRating();
                setShowRatingForm(false);
            },
        });
    };

    const renderStars = (rating: number, size: string = 'h-4 w-4') => {
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`${size} ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const averageRoundRating = (round: FeedbackRound) => {
        const ratings = round.section_ratings;
        const vals = [ratings.structure, ratings.content, ratings.methodology, ratings.writing, ratings.references];
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Link
                    href="/student/thesis"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Revisiones de Tesis
                </Link>

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

                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className={`bg-gradient-to-r ${statusCfg.bgColor} p-6 text-white relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{review.title}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                                        {statusCfg.label}
                                    </span>
                                    <span className="text-white/80 text-sm flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {review.status === 'pending' && (
                                    <button
                                        onClick={handleCancel}
                                        className="bg-red-500/80 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancelar Revisión
                                    </button>
                                )}
                                {canRequestRevision && !showRevisionForm && (
                                    <button
                                        onClick={() => setShowRevisionForm(true)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Solicitar Nueva Revisión
                                    </button>
                                )}
                                {canRate && !showRatingForm && (
                                    <button
                                        onClick={() => setShowRatingForm(true)}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Star className="h-4 w-4" />
                                        Calificar Revisión
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Tutor */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {review.tutor_profile?.user?.avatar ? (
                                        <img src={review.tutor_profile.user.avatar} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tutor</p>
                                    <p className="font-semibold text-gray-900">{review.tutor_profile?.user?.name || '—'}</p>
                                </div>
                            </div>

                            {/* Academic Level */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Nivel Académico</p>
                                    <p className="font-semibold text-gray-900">{LEVEL_LABELS[review.academic_level] || review.academic_level}</p>
                                </div>
                            </div>

                            {/* Round */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <RefreshCw className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ronda</p>
                                    <p className="font-semibold text-gray-900">
                                        {review.current_round} de {review.max_rounds}
                                    </p>
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <Coins className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Costo</p>
                                    <p className="font-semibold text-gray-900">{review.tokens_cost} tokens</p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            {review.subject_area && (
                                <div>
                                    <span className="text-xs text-gray-400 font-medium">Área temática: </span>
                                    <span className="text-sm text-gray-700">{review.subject_area}</span>
                                </div>
                            )}
                            {review.instructions && (
                                <div>
                                    <h3 className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Instrucciones
                                    </h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">{review.instructions}</p>
                                </div>
                            )}
                        </div>

                        {/* Final Rating */}
                        {review.final_rating && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Tu Calificación Final</h3>
                                <div className="flex items-center gap-2">
                                    {renderStars(review.final_rating, 'h-6 w-6')}
                                    <span className="text-lg font-bold text-gray-900">{review.final_rating}/5</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* File Downloads */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Archivos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {review.original_file_url && (
                            <a
                                href={review.original_file_url}
                                download
                                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
                            >
                                <div className="h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Download className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">Tesis Original</p>
                                    <p className="text-xs text-gray-400">Archivo enviado por ti</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                            </a>
                        )}
                        {review.feedback_rounds.map((round) =>
                            round.annotated_file_url ? (
                                <a
                                    key={round.id}
                                    href={round.annotated_file_url}
                                    download
                                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors group"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                                            Tesis Anotada — Ronda {round.round_number}
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(round.created_at)}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                </a>
                            ) : null,
                        )}
                    </div>
                    {!review.original_file_url && review.feedback_rounds.every((r) => !r.annotated_file_url) && (
                        <p className="text-gray-400 text-center py-4">No hay archivos disponibles aún.</p>
                    )}
                </div>

                {/* Feedback Rounds */}
                {review.feedback_rounds.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-amber-500" />
                            Retroalimentación del Tutor
                        </h2>
                        {review.feedback_rounds
                            .sort((a, b) => b.round_number - a.round_number)
                            .map((round) => (
                                <div key={round.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Ronda {round.round_number}</h3>
                                                <p className="text-xs text-gray-500">{formatDate(round.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">Promedio:</span>
                                            {renderStars(Math.round(Number(averageRoundRating(round))), 'h-4 w-4')}
                                            <span className="text-sm font-bold text-gray-900">{averageRoundRating(round)}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        {/* Section Ratings */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                            {Object.entries(round.section_ratings).map(([key, value]) => (
                                                <div key={key} className="text-center p-3 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 font-medium mb-1.5">
                                                        {RATING_LABELS[key] || key}
                                                    </p>
                                                    {renderStars(value, 'h-5 w-5')}
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{value}/5</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* General Comments */}
                                        {round.general_comments && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Comentarios Generales</h4>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                                        {round.general_comments}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* No feedback yet */}
                {review.feedback_rounds.length === 0 && review.status !== 'cancelled' && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {review.status === 'pending' ? 'Esperando Asignación' : 'Sin Retroalimentación Aún'}
                        </h3>
                        <p className="text-gray-500">
                            {review.status === 'pending'
                                ? 'Tu solicitud está pendiente. El tutor aún no ha comenzado la revisión.'
                                : 'El tutor aún no ha enviado su retroalimentación.'}
                        </p>
                    </div>
                )}

                {/* Request Revision Form */}
                {showRevisionForm && canRequestRevision && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Solicitar Nueva Revisión
                            </h2>
                            <p className="text-amber-100 text-sm mt-1">
                                Ronda {review.current_round} de {review.max_rounds} — Describe qué necesitas que se revise
                            </p>
                        </div>
                        <form onSubmit={handleRequestRevision} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Notas de Revisión
                                </label>
                                <textarea
                                    value={revisionData.revision_notes}
                                    onChange={(e) => setRevisionData('revision_notes', e.target.value)}
                                    rows={4}
                                    placeholder="Describe los aspectos que deseas que el tutor revise nuevamente..."
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none ${
                                        revisionErrors.revision_notes
                                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-300 focus:border-indigo-500'
                                    }`}
                                />
                                {revisionErrors.revision_notes && (
                                    <p className="text-red-500 text-xs mt-1">{revisionErrors.revision_notes}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Upload className="h-4 w-4 inline mr-1" />
                                    Archivo Actualizado (opcional)
                                </label>
                                <div
                                    onClick={() => revisionFileRef.current?.click()}
                                    className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-indigo-50 ${
                                        revisionErrors.file ? 'border-red-300 bg-red-50 hover:bg-red-100' : revisionFileName ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                                    }`}
                                >
                                    {revisionFileName ? (
                                        <>
                                            <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                                            <p className="text-sm font-medium text-gray-900">{revisionFileName}</p>
                                            <p className="text-xs text-gray-400 mt-1">Haz clic para cambiar</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Haz clic para subir versión actualizada</p>
                                            <p className="text-xs text-gray-400">Solo archivos PDF</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={revisionFileRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleRevisionFileChange(e.target.files?.[0] || null)}
                                />
                                {revisionErrors.file && (
                                    <p className="text-red-500 text-xs mt-1">{revisionErrors.file}</p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowRevisionForm(false); resetRevision(); setRevisionFileName(''); }}
                                    className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={revisionProcessing}
                                    className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {revisionProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Solicitar Revisión
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Rating Form */}
                {showRatingForm && canRate && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Calificar Revisión
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                ¿Qué tan satisfecho estás con la revisión de tu tesis?
                            </p>
                        </div>
                        <form onSubmit={handleSubmitRating} className="p-6 space-y-5">
                            {ratingErrors.rating && (
                                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                    {ratingErrors.rating}
                                </div>
                            )}
                            <div className="text-center">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Tu Calificación
                                </label>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(rating)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRatingData('rating', rating)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-10 w-10 ${
                                                    rating <= (hoverRating || ratingData.rating)
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {ratingData.rating > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        {ratingData.rating === 1 && 'Mala'}
                                        {ratingData.rating === 2 && 'Regular'}
                                        {ratingData.rating === 3 && 'Buena'}
                                        {ratingData.rating === 4 && 'Muy Buena'}
                                        {ratingData.rating === 5 && 'Excelente'}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowRatingForm(false); resetRating(); }}
                                    className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={ratingProcessing || ratingData.rating === 0}
                                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {ratingProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Enviar Calificación
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Warning for max rounds reached */}
                {review.status === 'completed' && review.current_round >= review.max_rounds && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-amber-800 text-sm font-medium">Máximo de rondas alcanzado</p>
                            <p className="text-amber-700 text-xs mt-0.5">
                                Has alcanzado el máximo de {review.max_rounds} rondas de revisión para esta tesis. Si necesitas más ayuda, puedes crear una nueva solicitud de revisión.
                            </p>
                            <Link
                                href="/student/thesis/create"
                                className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-medium mt-2"
                            >
                                <Plus className="h-4 w-4" />
                                Crear nueva revisión
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

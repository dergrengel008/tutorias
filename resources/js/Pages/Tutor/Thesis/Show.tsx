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
    ArrowLeft,
    AlertTriangle,
    Send,
    RefreshCw,
    Play,
    GraduationCap,
    Eye,
} from 'lucide-react';

interface Student {
    id: number;
    name: string;
    avatar?: string;
}

interface FeedbackRound {
    id: number;
    round_number: number;
    overall_comments: string;
    structure_rating: number;
    content_rating: number;
    methodology_rating: number;
    writing_rating: number;
    references_rating: number;
    annotated_file_path?: string;
    annotated_filename?: string;
    created_at: string;
}

interface ThesisReviewDetail {
    id: number;
    title: string;
    academic_level: 'pregrado' | 'maestria' | 'doctorado';
    subject_area?: string;
    instructions?: string;
    file_path?: string;
    original_filename?: string;
    status: 'pending' | 'in_review' | 'needs_revision' | 'completed';
    tokens_cost: number;
    tutor_earned_tokens: number;
    current_round: number;
    max_rounds: number;
    final_rating?: number;
    accepted_at?: string;
    completed_at?: string;
    deadline?: string;
    created_at: string;
    student?: Student;
    feedbacks?: FeedbackRound[];
}

interface PageProps {
    review: ThesisReviewDetail;
}

const LEVEL_LABELS: Record<string, string> = {
    pregrado: 'Pregrado',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bannerColor: string }> = {
    pending: {
        label: 'Pendiente de Aceptación',
        color: 'bg-blue-100 text-blue-800',
        bannerColor: 'from-blue-600 to-indigo-600',
    },
    in_review: {
        label: 'En Revisión',
        color: 'bg-green-100 text-green-800',
        bannerColor: 'from-green-600 to-teal-600',
    },
    needs_revision: {
        label: 'Necesita Corrección',
        color: 'bg-amber-100 text-amber-800',
        bannerColor: 'from-amber-600 to-orange-600',
    },
    completed: {
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
        bannerColor: 'from-gray-600 to-slate-600',
    },
};

function StarRatingInput({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    error?: string;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={`h-7 w-7 ${
                                star <= (hover || value)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 font-medium">{value}/5</span>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function FeedbackRoundCard({ feedback }: { feedback: FeedbackRound }) {
    const avgRating = (
        (feedback.structure_rating +
            feedback.content_rating +
            feedback.methodology_rating +
            feedback.writing_rating +
            feedback.references_rating) /
        5
    ).toFixed(1);

    const ratingFields = [
        { label: 'Estructura', value: feedback.structure_rating },
        { label: 'Contenido', value: feedback.content_rating },
        { label: 'Metodología', value: feedback.methodology_rating },
        { label: 'Redacción', value: feedback.writing_rating },
        { label: 'Referencias', value: feedback.references_rating },
    ];

    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    Ronda {feedback.round_number}
                </h4>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                        {new Date(feedback.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {ratingFields.map((field) => (
                    <div key={field.label} className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                        <div className="flex items-center justify-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                        i < field.value
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {feedback.overall_comments}
                </p>
            </div>

            {/* Annotated File Download */}
            {feedback.annotated_file_path && feedback.annotated_filename && (
                <a
                    href={`/thesis-annotated/${feedback.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                    <Download className="h-4 w-4" />
                    {feedback.annotated_filename}
                </a>
            )}
        </div>
    );
}

export default function TutorThesisShow({ review }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const statusConfig = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;
    const feedbacks: FeedbackRound[] = review.feedbacks || [];
    const previousFeedbacks = feedbacks.sort((a, b) => b.round_number - a.round_number);

    const canAccept = review.status === 'pending';
    const canSubmitFeedback = review.status === 'in_review' || review.status === 'needs_revision';

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        overall_comments: '',
        structure_rating: 0,
        content_rating: 0,
        methodology_rating: 0,
        writing_rating: 0,
        references_rating: 0,
        annotated_file: null as File | null,
        action: 'complete' as 'complete' | 'needs_revision',
    });

    const handleAccept = () => {
        if (confirm('¿Deseas aceptar esta revisión de tesis?')) {
            router.post(`/tutor/thesis/${review.id}/accept`);
        }
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tutor/thesis/${review.id}/submit-feedback`, {
            onSuccess: () => {
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('annotated_file', file);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const formatDeadline = (dateStr: string) => {
        const deadline = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;
        return { formatted: formatDate(dateStr), isOverdue, diffDays };
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Link
                    href="/tutor/thesis"
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

                {/* Thesis Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className={`bg-gradient-to-r ${statusConfig.bannerColor} p-6 text-white`}>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{review.title}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            review.status === 'pending'
                                                ? 'bg-blue-400/20 text-blue-100'
                                                : review.status === 'in_review'
                                                ? 'bg-green-400/20 text-green-100'
                                                : review.status === 'needs_revision'
                                                ? 'bg-amber-400/20 text-amber-100'
                                                : 'bg-gray-400/20 text-gray-100'
                                        }`}
                                    >
                                        {statusConfig.label}
                                    </span>
                                    <span className="text-white/70 text-sm flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        Ronda {review.current_round}/{review.max_rounds}
                                    </span>
                                    {review.deadline && (
                                        <span
                                            className={`text-sm flex items-center gap-1 ${
                                                formatDeadline(review.deadline).isOverdue
                                                    ? 'text-red-200 font-medium'
                                                    : 'text-white/70'
                                            }`}
                                        >
                                            <Clock className="h-4 w-4" />
                                            {formatDeadline(review.deadline).isOverdue
                                                ? 'Vencida'
                                                : formatDate(review.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {canAccept && (
                                    <button
                                        onClick={handleAccept}
                                        className="bg-white text-indigo-700 rounded-lg px-5 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 hover:bg-indigo-50 shadow-md"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Aceptar Revisión
                                    </button>
                                )}
                                {review.file_path && (
                                    <a
                                        href={`/tutor/thesis/${review.id}/download`}
                                        className="bg-white text-indigo-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 hover:bg-indigo-50"
                                    >
                                        <Download className="h-4 w-4" />
                                        Descargar Tesis
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Student */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {review.student?.avatar ? (
                                        <img
                                            src={review.student.avatar}
                                            alt={review.student.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <GraduationCap className="h-6 w-6 text-indigo-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Estudiante</p>
                                    <p className="font-semibold text-gray-900">
                                        {review.student?.name || 'Estudiante'}
                                    </p>
                                </div>
                            </div>

                            {/* Academic Level */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Nivel Académico</p>
                                    <p className="font-semibold text-gray-900">
                                        {LEVEL_LABELS[review.academic_level] || review.academic_level}
                                    </p>
                                </div>
                            </div>

                            {/* Tokens Earned */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Star className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tokens a Ganar</p>
                                    <p className="font-semibold text-gray-900">
                                        +{review.tutor_earned_tokens} tokens
                                    </p>
                                </div>
                            </div>

                            {/* File */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">Archivo</p>
                                    <p className="font-semibold text-gray-900 truncate text-sm">
                                        {review.original_filename || 'Sin archivo'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        {review.instructions && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4" />
                                    Instrucciones del Estudiante
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {review.instructions}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Subject Area */}
                        {review.subject_area && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4" />
                                    Área Temática
                                </h3>
                                <p className="text-gray-700">{review.subject_area}</p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {review.accepted_at && (
                                <div className="text-gray-600">
                                    <span className="text-gray-400">Aceptada:</span>{' '}
                                    {formatDate(review.accepted_at)}
                                </div>
                            )}
                            {review.completed_at && (
                                <div className="text-gray-600">
                                    <span className="text-gray-400">Completada:</span>{' '}
                                    {formatDate(review.completed_at)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Previous Feedback Rounds */}
                {previousFeedbacks.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <RefreshCw className="h-5 w-5 text-indigo-500" />
                            Historial de Retroalimentación
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {previousFeedbacks.map((fb) => (
                                <FeedbackRoundCard key={fb.id} feedback={fb} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback Form */}
                {canSubmitFeedback && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Send className="h-5 w-5 text-indigo-500" />
                            {review.status === 'needs_revision'
                                ? `Retroalimentación - Ronda ${review.current_round}`
                                : `Retroalimentación - Ronda ${review.current_round}`}
                        </h2>

                        {review.status === 'needs_revision' && (
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 mb-6">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                <p className="text-amber-800 text-sm">
                                    El estudiante ha enviado una versión actualizada. Revisa el nuevo archivo y proporciona retroalimentación.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmitFeedback} className="space-y-6">
                            {/* Star Ratings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <StarRatingInput
                                    label="Estructura"
                                    value={data.structure_rating}
                                    onChange={(val) => setData('structure_rating', val)}
                                    error={errors.structure_rating}
                                />
                                <StarRatingInput
                                    label="Contenido"
                                    value={data.content_rating}
                                    onChange={(val) => setData('content_rating', val)}
                                    error={errors.content_rating}
                                />
                                <StarRatingInput
                                    label="Metodología"
                                    value={data.methodology_rating}
                                    onChange={(val) => setData('methodology_rating', val)}
                                    error={errors.methodology_rating}
                                />
                                <StarRatingInput
                                    label="Redacción"
                                    value={data.writing_rating}
                                    onChange={(val) => setData('writing_rating', val)}
                                    error={errors.writing_rating}
                                />
                                <div className="sm:col-span-2">
                                    <StarRatingInput
                                        label="Referencias"
                                        value={data.references_rating}
                                        onChange={(val) => setData('references_rating', val)}
                                        error={errors.references_rating}
                                    />
                                </div>
                            </div>

                            {/* Overall Comments */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Comentarios Generales <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.overall_comments}
                                    onChange={(e) => setData('overall_comments', e.target.value)}
                                    rows={6}
                                    required
                                    placeholder="Proporciona retroalimentación detallada sobre la tesis..."
                                    className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none ${
                                        errors.overall_comments
                                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:bg-white'
                                    }`}
                                />
                                {errors.overall_comments && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.overall_comments}</p>
                                )}
                            </div>

                            {/* Annotated File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Archivo Anotado (opcional)
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                        errors.annotated_file
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                                    }`}
                                >
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    {data.annotated_file ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText className="h-4 w-4 text-indigo-600" />
                                            <span className="text-sm text-indigo-600 font-medium">
                                                {data.annotated_file.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600 font-medium">
                                                Haz clic para subir un archivo PDF anotado
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PDF, máximo 50 MB
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {errors.annotated_file && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.annotated_file}</p>
                                )}
                            </div>

                            {/* Action Radio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Decisión <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                            data.action === 'complete'
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="action"
                                            value="complete"
                                            checked={data.action === 'complete'}
                                            onChange={() => setData('action', 'complete')}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className={`h-5 w-5 ${data.action === 'complete' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            <div>
                                                <p className={`text-sm font-semibold ${data.action === 'complete' ? 'text-emerald-800' : 'text-gray-700'}`}>
                                                    Completar Revisión
                                                </p>
                                                <p className="text-xs text-gray-500">La tesis cumple los requisitos</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                                            data.action === 'needs_revision'
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="action"
                                            value="needs_revision"
                                            checked={data.action === 'needs_revision'}
                                            onChange={() => setData('action', 'needs_revision')}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={`h-5 w-5 ${data.action === 'needs_revision' ? 'text-amber-600' : 'text-gray-400'}`} />
                                            <div>
                                                <p className={`text-sm font-semibold ${data.action === 'needs_revision' ? 'text-amber-800' : 'text-gray-700'}`}>
                                                    Solicitar Correcciones
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {review.current_round >= review.max_rounds
                                                        ? `Última ronda disponible (${review.current_round}/${review.max_rounds})`
                                                        : `Ronda ${review.current_round} de ${review.max_rounds}`}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {errors.action && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.action}</p>
                                )}
                            </div>

                            {/* General Errors */}
                            {Object.keys(errors).length > 0 &&
                                !errors.overall_comments &&
                                !errors.structure_rating &&
                                !errors.content_rating &&
                                !errors.methodology_rating &&
                                !errors.writing_rating &&
                                !errors.references_rating &&
                                !errors.annotated_file &&
                                !errors.action && (
                                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                        {Object.values(errors).map((error, i) => (
                                            <p key={i}>{String(error)}</p>
                                        ))}
                                    </div>
                                )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full font-bold rounded-xl px-6 py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shadow-md ${
                                    data.action === 'complete'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                                }`}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        {data.action === 'complete'
                                            ? 'Completar Revisión'
                                            : 'Enviar Correcciones'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Completed State */}
                {review.status === 'completed' && previousFeedbacks.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Revisión Completada</h3>
                        <p className="text-gray-500">Esta revisión ha sido marcada como completada.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

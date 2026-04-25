import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Calendar,
    Clock,
    Star,
    User,
    DollarSign,
    MessageSquare,
    Play,
    Square,
    CheckCircle,
    XCircle,
    FileText,
    Send,
    Video,
    XCircle as BanIcon,
    Maximize2,
    Minimize2,
    Timer,
} from 'lucide-react';
import { useCountdown, useRemainingTime } from '@/Hooks/useCountdown';

interface PageProps {
    session: any;
    canReview: boolean;
    existingReview: any;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'En Progreso', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

export default function SessionShow({ session, canReview, existingReview }: PageProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { role?: string; id?: number } };
    const flash = props.flash as { success?: string; error?: string };
    const isTutor = auth?.user?.role === 'tutor';
    const isStudent = auth?.user?.role === 'student';
    const status = statusConfig[session.status];

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || '',
        tutor_profile_id: session.tutor_profile_id || '',
        tutoring_session_id: session.id || '',
        type: 'review',
    });

    const [hoverRating, setHoverRating] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [videoFullscreen, setVideoFullscreen] = useState(false);

    // Countdowns
    const countdown = useCountdown(session.scheduled_at);
    const remaining = useRemainingTime(session.duration_minutes, session.started_at);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStartSession = () => {
        if (confirm('¿Deseas iniciar esta sesión?')) {
            router.post(`/sessions/${session.id}/start`);
        }
    };

    const handleEndSession = () => {
        if (confirm('¿Deseas finalizar esta sesión?')) {
            router.post(`/sessions/${session.id}/end`);
        }
    };

    const handleCancelSession = () => {
        if (confirm('¿Estás seguro de que deseas cancelar esta sesión? Se te reembolsarán los tokens.')) {
            router.post(`/sessions/${session.id}/cancel`);
        }
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reviews', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
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

                {/* Session Header */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{session.title}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        session.status === 'in_progress' ? 'bg-emerald-400/20 text-emerald-100' :
                                        session.status === 'completed' ? 'bg-gray-400/20 text-gray-100' :
                                        session.status === 'cancelled' ? 'bg-red-400/20 text-red-100' :
                                        'bg-blue-400/20 text-blue-100'
                                    }`}>
                                        {status.label}
                                    </span>
                                    {session.scheduled_at && (
                                        <span className="text-indigo-200 text-sm flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(session.scheduled_at)}
                                        </span>
                                    )}
                                    {/* Live countdown for scheduled sessions */}
                                    {session.status === 'scheduled' && countdown.text && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse ${countdown.className}`}>
                                            <Timer className="h-3 w-3" />
                                            {countdown.text}
                                        </span>
                                    )}
                                    {/* Remaining time for in_progress sessions */}
                                    {session.status === 'in_progress' && remaining.text && (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${remaining.expired ? 'bg-red-400/30 text-red-200' : 'bg-amber-400/30 text-amber-200'}`}>
                                            <Timer className="h-3 w-3" />
                                            {remaining.expired ? 'Tiempo agotado!' : `Quedan ${remaining.text}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {isTutor && session.status === 'scheduled' && (
                                    <button
                                        onClick={handleStartSession}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Play className="h-4 w-4" />
                                        Iniciar Sesión
                                    </button>
                                )}
                                {isTutor && session.status === 'in_progress' && (
                                    <button
                                        onClick={handleEndSession}
                                        className="bg-orange-500 hover:bg-orange-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Square className="h-4 w-4" />
                                        Finalizar Sesión
                                    </button>
                                )}
                                {session.status === 'in_progress' && (
                                    <a
                                        href={`/whiteboard/${session.id}`}
                                        className="bg-white text-indigo-700 rounded-lg px-4 py-2 text-sm font-bold transition-colors flex items-center gap-2 hover:bg-indigo-50"
                                    >
                                        <Play className="h-4 w-4" />
                                        Ir a la Pizarra
                                    </a>
                                )}
                                {session.status === 'scheduled' && !isTutor && (
                                    <button
                                        onClick={handleCancelSession}
                                        className="bg-red-500/80 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <BanIcon className="h-4 w-4" />
                                        Cancelar
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
                                    {session.tutor_profile?.user?.avatar ? (
                                        <img src={session.tutor_profile.user.avatar} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-indigo-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tutor</p>
                                    <p className="font-semibold text-gray-900">{session.tutor_profile?.user?.name}</p>
                                </div>
                            </div>

                            {/* Student */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {session.student?.avatar ? (
                                        <img src={session.student.avatar} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Estudiante</p>
                                    <p className="font-semibold text-gray-900">{session.student?.name}</p>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Duración</p>
                                    <p className="font-semibold text-gray-900">{session.duration_minutes} minutos</p>
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                    <DollarSign className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Costo</p>
                                    <p className="font-semibold text-gray-900">{session.tokens_cost} tokens</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {session.description && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    Descripción
                                </h3>
                                <p className="text-gray-700 whitespace-pre-line">{session.description}</p>
                            </div>
                        )}

                        {/* Session Timings */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            {session.scheduled_at && (
                                <div className="text-gray-600">
                                    <span className="text-gray-400">Programada:</span>{' '}
                                    {formatDate(session.scheduled_at)}
                                </div>
                            )}
                            {session.started_at && (
                                <div className="text-gray-600">
                                    <span className="text-gray-400">Iniciada:</span>{' '}
                                    {formatDate(session.started_at)}
                                </div>
                            )}
                            {session.ended_at && (
                                <div className="text-gray-600">
                                    <span className="text-gray-400">Finalizada:</span>{' '}
                                    {formatDate(session.ended_at)}
                                </div>
                            )}
                        </div>

                        {/* Meeting Link (Video Call) */}
                        {session.meeting_link && (session.status === 'in_progress' || session.status === 'scheduled') && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                                    <Video className="h-4 w-4" />
                                    Videollamada
                                </h3>
                                {showVideo ? (
                                    <div className={`${videoFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'} rounded-xl overflow-hidden border border-gray-200`}>
                                        <div className={`${videoFullscreen ? 'flex justify-end p-2' : 'flex justify-between items-center px-3 py-2 bg-gray-50 border-b border-gray-200'}`}>
                                            {!videoFullscreen && (
                                                <span className="text-sm font-medium text-gray-700">Sesión de Video en Vivo</span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setVideoFullscreen(!videoFullscreen)}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                                                    title={videoFullscreen ? 'Minimizar' : 'Pantalla completa'}
                                                >
                                                    {videoFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => { setShowVideo(false); setVideoFullscreen(false); }}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                                                    title="Cerrar videollamada"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <iframe
                                            src={session.meeting_link + (session.meeting_link.includes('?') ? '&' : '?') + 'config.startWithVideoMuted=true&config.startWithAudioMuted=false&config.prejoinPageEnabled=false'}
                                            className="w-full bg-gray-900"
                                            style={{ height: videoFullscreen ? '100vh' : '480px' }}
                                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                                            allowFullScreen
                                            title="Videollamada Jitsi Meet"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => setShowVideo(true)}
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors shadow-md shadow-indigo-200"
                                        >
                                            <Video className="h-5 w-5" />
                                            Unirse a Videollamada
                                        </button>
                                        <a
                                            href={session.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                            Abrir en nueva pestaña
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Whiteboard Preview */}
                {(session.status === 'in_progress' || session.status === 'completed') && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Pizarra Colaborativa
                        </h2>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400">
                            {session.status === 'in_progress' ? (
                                <>
                                    <FileText className="h-12 w-12 mb-3" />
                                    <p className="font-medium text-lg">Pizarra Disponible</p>
                                    <p className="text-sm mt-1">Accede a la pizarra para trabajar en tiempo real</p>
                                    <a
                                        href={`/whiteboard/${session.id}`}
                                        className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors"
                                    >
                                        <Play className="h-5 w-5" />
                                        Ir a la Pizarra
                                    </a>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-12 w-12 mb-3 text-gray-300" />
                                    <p className="font-medium">La sesión ha finalizado</p>
                                    <p className="text-sm mt-1">El contenido de la pizarra se guardó automáticamente</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Review Section */}
                <div id="review" className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                        Reseña
                    </h2>

                    {existingReview ? (
                        <div className="bg-amber-50 rounded-xl p-6">
                            <div className="flex items-center gap-1 mb-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < existingReview.rating
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            {existingReview.comment && (
                                <p className="text-gray-700">{existingReview.comment}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(existingReview.created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    ) : canReview ? (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <input type="hidden" name="tutoring_session_id" value={data.tutoring_session_id} />
                            <input type="hidden" name="tutor_profile_id" value={data.tutor_profile_id} />
                            <input type="hidden" name="type" value="review" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tu Calificación
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(rating)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setData('rating', rating)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${
                                                    rating <= (hoverRating || data.rating)
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && (
                                    <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tu Comentario (opcional)
                                </label>
                                <textarea
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                    placeholder="Comparte tu experiencia con este tutor..."
                                />
                                {errors.comment && (
                                    <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing || data.rating === 0}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                                {processing ? 'Enviando...' : 'Enviar Reseña'}
                            </button>
                        </form>
                    ) : (
                        <p className="text-gray-400 text-center py-4">
                            {isTutor
                                ? 'Las reseñas son dejadas por los estudiantes después de completar la sesión.'
                                : 'Podrás dejar una reseña cuando la sesión se complete.'}
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

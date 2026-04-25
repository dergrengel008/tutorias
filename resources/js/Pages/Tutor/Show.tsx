import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import {
    Star,
    MapPin,
    Clock,
    DollarSign,
    GraduationCap,
    Award,
    BookOpen,
    Calendar,
    User,
    CheckCircle,
    MessageSquare,
    FileText,
} from 'lucide-react';
import type { TutorProfile, Review, TutorCourse } from '@/types';

interface PageProps {
    tutor: TutorProfile;
    reviews: Review[];
    courses?: TutorCourse[];
}

export default function TutorShow({ tutor, reviews, courses }: PageProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { id?: number; role?: string } | null };
    const isStudent = auth?.user?.role === 'student';
    const isApproved = tutor.status === 'approved';

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingTitle, setBookingTitle] = useState('');
    const [bookingDescription, setBookingDescription] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingDuration, setBookingDuration] = useState(60);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);

    const bookingCost = tutor.hourly_rate
        ? Math.ceil(Number(tutor.hourly_rate) * (bookingDuration / 60))
        : bookingDuration / 60;

    const renderStars = (rating: number, size = 'w-5 h-5') => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`${size} ${
                    i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleBookSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user) {
            router.get('/login');
            return;
        }
        setBookingSubmitting(true);
        try {
            router.post('/student/sessions/book', {
                tutor_profile_id: tutor.id,
                title: bookingTitle,
                description: bookingDescription,
                scheduled_at: bookingDate,
                duration_minutes: bookingDuration,
                tokens_cost: bookingCost,
            });
            setShowBookingModal(false);
        } catch {
            // Error handled by Inertia
        } finally {
            setBookingSubmitting(false);
        }
    };

    const avgRating = tutor.average_rating || (reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0);

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <div className="shrink-0">
                                <div className="h-32 w-32 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden shadow-2xl flex items-center justify-center">
                                    {tutor.user?.avatar ? (
                                        <img
                                            src={tutor.user.avatar}
                                            alt={tutor.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-bold text-5xl">
                                            {tutor.user?.name?.charAt(0) || 'T'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left text-white">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold">
                                            {tutor.user?.name}
                                        </h1>
                                        <p className="text-indigo-200 text-lg mt-1">
                                            {tutor.professional_title || 'Tutor'}
                                        </p>
                                    </div>
                                    {isApproved && (
                                        <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-100 px-3 py-1 rounded-full text-sm font-medium">
                                            <CheckCircle className="h-4 w-4" />
                                            Verificado
                                        </span>
                                    )}
                                </div>

                                {/* Stats Row */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                                    <div className="flex items-center gap-1.5">
                                        {renderStars(avgRating, 'w-5 h-5')}
                                        <span className="text-white font-semibold ml-1">
                                            {avgRating.toFixed(1)}
                                        </span>
                                        <span className="text-indigo-200">
                                            ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-indigo-200">
                                        <Clock className="h-5 w-5" />
                                        <span>
                                            {tutor.total_sessions} sesion{tutor.total_sessions !== 1 ? 'es' : ''}
                                        </span>
                                    </div>
                                    {tutor.years_experience > 0 && (
                                        <div className="flex items-center gap-1.5 text-indigo-200">
                                            <Award className="h-5 w-5" />
                                            <span>
                                                {tutor.years_experience} año
                                                {tutor.years_experience !== 1 ? 's' : ''} de experiencia
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Specialties */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                    {tutor.specialties?.map((s) => (
                                        <span
                                            key={s.id}
                                            className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20"
                                        >
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="shrink-0">
                                {isApproved && isStudent ? (
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="bg-white text-indigo-700 font-bold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 text-lg"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        Reservar Sesión
                                    </button>
                                ) : !auth?.user ? (
                                    <a
                                        href="/login"
                                        className="bg-white text-indigo-700 font-bold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 text-lg"
                                    >
                                        Iniciar Sesión
                                    </a>
                                ) : !isApproved ? (
                                    <div className="bg-yellow-100 text-yellow-800 rounded-xl px-6 py-3 text-center">
                                        <p className="font-semibold text-sm">Tutor no verificado</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* About */}
                            {tutor.user?.bio && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                        <User className="h-5 w-5 text-indigo-500" />
                                        Sobre Mí
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {tutor.user.bio}
                                    </p>
                                </div>
                            )}

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tutor.user?.city && (
                                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Ubicación</p>
                                            <p className="font-semibold text-gray-900">
                                                {tutor.user.city}
                                                {tutor.user.country ? `, ${tutor.user.country}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tarifa por Hora</p>
                                        <p className="font-semibold text-gray-900">
                                            {tutor.hourly_rate
                                                ? `${tutor.hourly_rate} tokens`
                                                : 'No especificada'}
                                        </p>
                                    </div>
                                </div>
                                {tutor.education_level && (
                                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Educación</p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {tutor.education_level.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Experiencia</p>
                                        <p className="font-semibold text-gray-900">
                                            {tutor.years_experience} año
                                            {tutor.years_experience !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Courses/Documents */}
                            {courses && courses.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                        <FileText className="h-5 w-5 text-indigo-500" />
                                        Cursos y Documentos
                                    </h2>
                                    <div className="space-y-3">
                                        {courses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {course.title}
                                                    </p>
                                                    {course.description && (
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {course.description}
                                                        </p>
                                                    )}
                                                    {course.institution && (
                                                        <p className="text-xs text-gray-400">
                                                            {course.institution}
                                                            {course.year ? ` • ${course.year}` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                                    Reseñas ({reviews.length})
                                </h2>
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Aún no hay reseñas</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {review.is_anonymous
                                                                    ? 'Estudiante Anónimo'
                                                                    : review.reviewer?.name || 'Estudiante'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {formatDate(review.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(review.rating, 'w-4 h-4')}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-gray-600 ml-13">{review.comment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Resumen
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Calificación</span>
                                        <div className="flex items-center gap-1">
                                            {renderStars(avgRating, 'w-4 h-4')}
                                            <span className="text-sm font-semibold ml-1">
                                                {avgRating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Sesiones</span>
                                        <span className="font-semibold text-gray-900">
                                            {tutor.total_sessions}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Tarifa</span>
                                        <span className="font-semibold text-gray-900">
                                            {tutor.hourly_rate
                                                ? `${tutor.hourly_rate} tokens/h`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Respuesta</span>
                                        <span className="font-semibold text-gray-400">
                                            {tutor.response_time ? tutor.response_time : 'No disponible'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Ubicación
                                </h3>
                                {tutor.user?.city ? (
                                    <div className="h-48 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                        <MapPin className="h-8 w-8 mb-2" />
                                        <p className="font-medium">{tutor.user.city}</p>
                                        <p className="text-xs mt-1">
                                            Google Maps próximamente
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center text-sm">No se ha especificado ubicación</p>
                                )}
                            </div>

                            {/* Book CTA Mobile */}
                            <div className="lg:hidden">
                                {isApproved && isStudent && (
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        Reservar Sesión
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Reservar Sesión</h2>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <span className="text-gray-500 text-xl leading-none">×</span>
                            </button>
                        </div>

                        <form onSubmit={handleBookSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título de la Sesión
                                </label>
                                <input
                                    type="text"
                                    value={bookingTitle}
                                    onChange={(e) => setBookingTitle(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    placeholder="Ej: Tutoría de Matemáticas"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={bookingDescription}
                                    onChange={(e) => setBookingDescription(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                    placeholder="Describe lo que necesitas aprender..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha y Hora
                                </label>
                                <input
                                    type="datetime-local"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duración
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[30, 60, 90, 120].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setBookingDuration(d)}
                                            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                                                bookingDuration === d
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`
                                        }
                                        >
                                            {d} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-indigo-600">
                                    <span className="font-semibold">Costo: {bookingCost} tokens</span>
                                    <span className="text-xs ml-1">({bookingDuration} min)</span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingSubmitting}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
                                >
                                    {bookingSubmitting ? 'Reservando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DefaultLayout>
    );
}

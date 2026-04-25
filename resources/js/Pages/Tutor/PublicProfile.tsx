import { usePage, Link, router } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Star, MapPin, Clock, Calendar, CheckCircle, User, DollarSign, GraduationCap, Award, X, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface TutorProfileData {
    id: number;
    user?: { id: number; name: string; email: string; avatar?: string; bio?: string; city?: string; country?: string; phone?: string };
    professional_title?: string;
    education_level?: string;
    years_experience?: number | string;
    hourly_rate?: number | string;
    average_rating?: number | string;
    total_sessions?: number | string;
    status?: string;
    specialties?: { id: number; name: string }[];
}

interface Review {
    id: number;
    rating: number;
    comment?: string;
    is_anonymous?: boolean;
    reviewer?: { name: string };
    created_at: string;
}

interface PageProps {
    tutor: TutorProfileData;
    reviews?: Review[] | { data?: Review[] };
}

export default function TutorPublicProfile({ tutor: rawTutor, reviews: rawReviews }: PageProps) {
    const tutor = rawTutor || ({} as any);
    const rawReviewsArr = Array.isArray(rawReviews) ? rawReviews : (rawReviews as any)?.data || [];
    const reviews = rawReviewsArr;
    const auth = usePage().props.auth as { user?: { id?: number; role?: string } } | null;

    const isStudent = auth?.user?.role === 'student';
    const isApproved = tutor.status === 'approved';

    // Safe numeric values - DB returns strings
    const avgRating = Number(tutor.average_rating) || 0;
    const totalSessions = Number(tutor.total_sessions) || 0;
    const yearsExperience = Number(tutor.years_experience) || 0;
    const hourlyRate = Number(tutor.hourly_rate) || 0;

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        scheduled_at: '',
        scheduled_time: '',
        duration_minutes: '60',
        tokens_cost: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        const scheduled_at = form.scheduled_at && form.scheduled_time
            ? `${form.scheduled_at}T${form.scheduled_time}:00`
            : '';

        if (!scheduled_at) {
            setErrors({ scheduled_at: 'Selecciona fecha y hora' });
            setSubmitting(false);
            return;
        }

        const tokensCost = form.tokens_cost || String(hourlyRate || 1);

        router.post('/student/sessions/book', {
            tutor_profile_id: tutor.id,
            title: form.title,
            description: form.description || null,
            scheduled_at: scheduled_at,
            duration_minutes: Number(form.duration_minutes) || 60,
            tokens_cost: Number(tokensCost) || 1,
        }, {
            onSuccess: () => {
                setShowModal(false);
                setForm({ title: '', description: '', scheduled_at: '', scheduled_time: '', duration_minutes: '60', tokens_cost: '' });
            },
            onError: (err) => {
                setErrors(err as Record<string, string>);
            },
            onFinish: () => {
                setSubmitting(false);
            },
        });
    };

    // Get min date (tomorrow) for scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700">
                    <div className="max-w-5xl mx-auto px-4 py-16">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="h-32 w-32 rounded-2xl bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center shrink-0">
                                {tutor.user?.avatar ? (
                                    <img src={tutor.user.avatar} alt={tutor.user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-5xl">{(tutor.user?.name || 'T').charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left text-white">
                                <h1 className="text-3xl md:text-4xl font-bold">{tutor.user?.name || 'Tutor'}</h1>
                                <p className="text-indigo-200 text-lg mt-1">{tutor.professional_title || 'Tutor'}</p>
                                {isApproved && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-100 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                        <CheckCircle className="h-4 w-4" /> Verificado
                                    </span>
                                )}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                                        ))}
                                        <span className="text-white font-semibold ml-1">{avgRating.toFixed(1)}</span>
                                        <span className="text-indigo-200">({reviews.length})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-indigo-200">
                                        <Clock className="h-5 w-5" />
                                        <span>{totalSessions} sesiones</span>
                                    </div>
                                    {yearsExperience > 0 && (
                                        <div className="flex items-center gap-1.5 text-indigo-200">
                                            <Award className="h-5 w-5" />
                                            <span>{yearsExperience} año{yearsExperience !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>
                                {tutor.specialties?.length > 0 && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                        {tutor.specialties.map((s: any) => (
                                            <span key={s.id} className="px-3 py-1 bg-white/15 text-white rounded-full text-sm font-medium">{s.name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="shrink-0">
                                {isApproved && isStudent ? (
                                    <button onClick={() => setShowModal(true)} className="bg-white text-indigo-700 font-bold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 text-lg">
                                        <Calendar className="h-5 w-5" /> Reservar Sesión
                                    </button>
                                ) : !auth?.user ? (
                                    <Link href="/login" className="bg-white text-indigo-700 font-bold rounded-xl px-8 py-3 shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 text-lg">
                                        Iniciar Sesión
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {tutor.user?.bio && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4"><User className="h-5 w-5 text-indigo-500" /> Sobre Mí</h2>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tutor.user.bio}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tutor.user?.city && (
                                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MapPin className="h-6 w-6" /></div>
                                        <div><p className="text-sm text-gray-500">Ubicación</p><p className="font-semibold text-gray-900">{tutor.user.city}{tutor.user.country ? `, ${tutor.user.country}` : ''}</p></div>
                                    </div>
                                )}
                                <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><DollarSign className="h-6 w-6" /></div>
                                    <div><p className="text-sm text-gray-500">Tarifa</p><p className="font-semibold text-gray-900">{hourlyRate > 0 ? `${hourlyRate} tokens/h` : 'No especificada'}</p></div>
                                </div>
                                {tutor.education_level && (
                                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><GraduationCap className="h-6 w-6" /></div>
                                        <div><p className="text-sm text-gray-500">Educación</p><p className="font-semibold text-gray-900 capitalize">{String(tutor.education_level).replace(/_/g, ' ')}</p></div>
                                    </div>
                                )}
                                <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock className="h-6 w-6" /></div>
                                    <div><p className="text-sm text-gray-500">Experiencia</p><p className="font-semibold text-gray-900">{yearsExperience} año{yearsExperience !== 1 ? 's' : ''}</p></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Reseñas ({reviews.length})</h2>
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Aún no hay reseñas.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map((review: any) => (
                                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-5 w-5 text-gray-500" /></div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{review.is_anonymous ? 'Anónimo' : review.reviewer?.name || 'Estudiante'}</p>
                                                            <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('es-ES')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < Number(review.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
                                                </div>
                                                {review.comment && <p className="text-gray-600 ml-13">{review.comment}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Resumen</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Calificación</span><div className="flex items-center gap-1"><span className="text-sm font-semibold">{avgRating.toFixed(1)}</span></div></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Sesiones</span><span className="font-semibold text-gray-900">{totalSessions}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Tarifa</span><span className="font-semibold text-gray-900">{hourlyRate > 0 ? `${hourlyRate} tokens/h` : 'N/A'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-600" /> Reservar Sesión
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleBook} className="p-6 space-y-5">
                            {/* Tutor info summary */}
                            <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {(tutor.user?.name || 'T').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{tutor.user?.name || 'Tutor'}</p>
                                    <p className="text-sm text-gray-500">{tutor.professional_title || 'Tutor'} • {hourlyRate > 0 ? `${hourlyRate} tokens/h` : 'Tarifa no especificada'}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tema de la sesión *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="Ej: Ayuda con matemáticas"
                                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Describe lo que necesitas aprender..."
                                    rows={3}
                                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                                    <input
                                        type="date"
                                        value={form.scheduled_at}
                                        onChange={(e) => updateField('scheduled_at', e.target.value)}
                                        min={minDate}
                                        className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.scheduled_at ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                                    <input
                                        type="time"
                                        value={form.scheduled_time}
                                        onChange={(e) => updateField('scheduled_time', e.target.value)}
                                        className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.scheduled_at ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                    />
                                </div>
                            </div>
                            {(errors.scheduled_at || errors.scheduled_time) && <p className="text-red-500 text-sm">{errors.scheduled_at || errors.scheduled_time}</p>}

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duración *</label>
                                <select
                                    value={form.duration_minutes}
                                    onChange={(e) => updateField('duration_minutes', e.target.value)}
                                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.duration_minutes ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                >
                                    <option value="30">30 minutos</option>
                                    <option value="60">1 hora</option>
                                    <option value="90">1 hora 30 min</option>
                                    <option value="120">2 horas</option>
                                    <option value="180">3 horas</option>
                                </select>
                                {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
                            </div>

                            {/* Tokens cost */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Costo (tokens) *
                                    {hourlyRate > 0 && (
                                        <span className="text-gray-400 font-normal ml-2">
                                            Sugerido: {Math.ceil(hourlyRate * (Number(form.duration_minutes) || 60) / 60)} tokens
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={form.tokens_cost}
                                    onChange={(e) => updateField('tokens_cost', e.target.value)}
                                    min="1"
                                    placeholder={String(hourlyRate || 1)}
                                    className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.tokens_cost ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.tokens_cost && <p className="text-red-500 text-sm mt-1">{errors.tokens_cost}</p>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white font-bold rounded-xl px-6 py-3 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" /> Reservando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" /> Confirmar Reserva
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DefaultLayout>
    );
}

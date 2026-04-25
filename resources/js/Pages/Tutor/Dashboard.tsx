import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
    GraduationCap,
    Star,
    Calendar,
    Clock,
    Users,
    DollarSign,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    User,
    FileText,
    Shield,
    Play,
    XCircle,
    Timer,
    TrendingUp,
} from 'lucide-react';
import type { TutoringSession, Review, TutorDashboardStats } from '@/types';

interface PageProps {
    stats: TutorDashboardStats;
    upcomingSessions: TutoringSession[];
    recentReviews: Review[];
    profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
    rejectionReason?: string | null;
    monthlyEarnings?: { month: string; tokens: number; sesiones: number }[];
}

export default function TutorDashboard({
    stats,
    upcomingSessions,
    recentReviews,
    profileStatus,
    rejectionReason,
    monthlyEarnings,
}: PageProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { name: string; avatar?: string | null } };
    const flash = props.flash as { success?: string; error?: string };
    const chartData = monthlyEarnings || [];

    const isPending = profileStatus === 'pending';
    const isRejected = profileStatus === 'rejected';
    const isSuspended = profileStatus === 'suspended';
    const isApproved = profileStatus === 'approved';

    const statCards = [
        {
            label: 'Total Sesiones',
            value: stats.completed_sessions,
            icon: FileText,
            color: 'bg-blue-50 text-blue-700',
        },
        {
            label: 'Calificación Promedio',
            value: stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—',
            icon: Star,
            color: 'bg-amber-50 text-amber-700',
        },
        {
            label: 'Ganancias (Tokens)',
            value: stats.total_earnings,
            icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Estudiantes Activos',
            value: stats.total_students,
            icon: Users,
            color: 'bg-purple-50 text-purple-700',
        },
    ];

    const quickActions = [
        {
            label: 'Mi Perfil',
            href: '/tutor/profile/edit',
            icon: User,
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            label: 'Ver Sesiones',
            href: '/tutor/sessions',
            icon: Calendar,
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            label: 'Mis Ganancias',
            href: '/tutor/earnings',
            icon: DollarSign,
            color: 'from-amber-500 to-amber-600',
        },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    // Countdown state
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const getCountdown = (scheduledAt: string) => {
        const target = new Date(scheduledAt);
        const diffMs = target.getTime() - now.getTime();
        const totalMinutes = Math.floor(diffMs / 60000);

        if (totalMinutes < 0) return { text: 'Ha comenzado', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
        if (totalMinutes === 0) return { text: 'Ahora', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
        if (totalMinutes < 60) return { text: `En ${totalMinutes} min`, urgent: true, className: 'text-orange-600 bg-orange-50' };
        if (totalMinutes < 1440) {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return { text: mins > 0 ? `En ${hours}h ${mins}min` : `En ${hours}h`, urgent: hours < 2, className: hours < 2 ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50' };
        }
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        return { text: hours > 0 ? `En ${days}d ${hours}h` : `En ${days}d`, urgent: false, className: 'text-gray-600 bg-gray-50' };
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
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

                {/* Pending/Rejected/Suspended Warning */}
                {(isPending || isRejected || isSuspended) && (
                    <div
                        className={`rounded-2xl border-2 p-6 ${
                            isPending
                                ? 'bg-yellow-50 border-yellow-300'
                                : isRejected
                                ? 'bg-red-50 border-red-300'
                                : 'bg-orange-50 border-orange-300'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
                                    isPending
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : isRejected
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-orange-100 text-orange-600'
                                }`}
                            >
                                <Shield className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={`text-lg font-bold ${
                                        isPending
                                            ? 'text-yellow-800'
                                            : isRejected
                                            ? 'text-red-800'
                                            : 'text-orange-800'
                                    }`}
                                >
                                    {isPending && 'Tu perfil está pendiente de aprobación'}
                                    {isRejected && 'Tu perfil ha sido rechazado'}
                                    {isSuspended && 'Tu cuenta ha sido suspendida'}
                                </h3>
                                <p
                                    className={`mt-1 ${
                                        isPending
                                            ? 'text-yellow-700'
                                            : isRejected
                                            ? 'text-red-700'
                                            : 'text-orange-700'
                                    }`}
                                >
                                    {isPending &&
                                        'Un administrador revisará tu perfil y documentos. Recibirás una notificación cuando sea aprobado. Mientras tanto, no podrás recibir sesiones de tutoría.'}
                                    {isRejected &&
                                        `Tu perfil no cumplió con los requisitos de verificación. Motivo: ${rejectionReason || 'No especificado'}. Puedes actualizar tu perfil e intentar de nuevo.`}
                                    {isSuspended &&
                                        'Tu cuenta ha sido suspendida por un administrador. Si crees que esto es un error, contacta al soporte.'}
                                </p>
                                {(isPending || isRejected) && (
                                    <a
                                        href="/tutor/profile"
                                        className={`inline-flex items-center gap-2 mt-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            isPending
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        {isPending ? 'Verificar Perfil' : 'Actualizar Perfil'}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border-2 border-white/30">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-1">
                                ¡Bienvenido, {auth.user.name}!
                            </h1>
                            <p className="text-emerald-100 text-lg">
                                {isApproved
                                    ? 'Gestiona tus sesiones y conecta con estudiantes.'
                                    : isPending
                                    ? 'Completa tu perfil para empezar a recibir estudiantes.'
                                    : 'Revisa el estado de tu perfil para continuar.'}
                            </p>
                        </div>
                        <div className="hidden md:block text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                            <p className="text-emerald-200 text-sm font-medium">Estado</p>
                            <span
                                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    isApproved
                                        ? 'bg-emerald-400/20 text-emerald-100'
                                        : isPending
                                        ? 'bg-yellow-400/20 text-yellow-100'
                                        : isRejected
                                        ? 'bg-red-400/20 text-red-100'
                                        : 'bg-orange-400/20 text-orange-100'
                                }`}
                            >
                                {isApproved
                                    ? '✓ Aprobado'
                                    : isPending
                                    ? '⏳ Pendiente'
                                    : isRejected
                                    ? '✕ Rechazado'
                                    : '⊘ Suspendido'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resumen</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div
                                className={`h-14 w-14 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}
                            >
                                <stat.icon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Acciones</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickActions.map((action) => (
                            <a
                                key={action.label}
                                href={action.href}
                                className={`bg-gradient-to-r ${action.color} rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 group cursor-pointer`}
                            >
                                <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-lg">{action.label}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Actividad Reciente</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Sessions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-500" />
                                Próximas Sesiones
                            </h2>
                            <a
                                href="/tutor/sessions"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                Ver todas
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                        {upcomingSessions.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No hay sesiones programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.slice(0, 5).map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors duration-200"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {session.title}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {session.student?.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {session.scheduled_at
                                                    ? formatDate(session.scheduled_at)
                                                    : 'Por programar'}
                                            </p>
                                        </div>
                                        {session.scheduled_at && session.status === 'scheduled' && (() => {
                                            const cd = getCountdown(session.scheduled_at);
                                            return (
                                                <div className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${cd.className}`}>
                                                    <Timer className={`h-3.5 w-3.5 ${cd.urgent ? 'animate-pulse' : ''}`} />
                                                    <span>{cd.text}</span>
                                                </div>
                                            );
                                        })()}
                                        {session.status === 'in_progress' && (
                                            <a
                                                href={`/whiteboard/${session.id}`}
                                                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors animate-pulse"
                                            >
                                                <Play className="h-4 w-4" />
                                                <span className="hidden sm:inline">En vivo</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500" />
                                Reseñas Recientes
                            </h2>
                        </div>
                        {recentReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Aún no tienes reseñas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentReviews.slice(0, 5).map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {review.comment || 'Sin comentarios'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {review.is_anonymous
                                                ? 'Estudiante anónimo'
                                                : review.reviewer?.name || 'Estudiante'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Estadísticas</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Earnings Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Ganancias y Sesiones por Mes
                    </h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                />
                                <Area type="monotone" dataKey="tokens" name="Tokens Ganados" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                <Bar dataKey="sesiones" name="Sesiones" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                            Sin datos de ganancias aún. Comienza a dar tutorías para ver tus estadísticas.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

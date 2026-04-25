import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
    GraduationCap,
    CreditCard,
    Star,
    Calendar,
    Clock,
    Play,
    User,
    Search,
    DollarSign,
    CheckCircle,
    ChevronRight,
    Timer,
    TrendingUp,
} from 'lucide-react';
import type { TutoringSession } from '@/types';

interface StudentDashboardStats {
    totalSessions: number;
    upcomingSessions: number;
    tokenBalance: number;
    average_rating_given: number;
}

interface PageProps {
    stats: StudentDashboardStats;
    upcomingSessions: TutoringSession[];
    recentReviews: any[];
    monthlyActivity?: { month: string; tokens: number; sesiones: number }[];
}

export default function StudentDashboard({
    stats,
    upcomingSessions,
    recentReviews,
    monthlyActivity,
}: PageProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { name: string; avatar?: string | null } };
    const flash = props.flash as { success?: string; error?: string };
    const chartData = monthlyActivity || [];

    const tokenBalance = stats.tokenBalance;

    const statCards = [
        {
            label: 'Sesiones Completadas',
            value: stats.totalSessions,
            icon: CheckCircle,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Tokens Disponibles',
            value: tokenBalance,
            icon: DollarSign,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50 text-indigo-700',
        },
        {
            label: 'Calificación Promedio',
            value: stats.average_rating_given > 0 ? stats.average_rating_given.toFixed(1) : '—',
            icon: Star,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50 text-amber-700',
        },
    ];

    const quickActions = [
        {
            label: 'Buscar Tutores',
            href: '/student/find-tutors',
            icon: Search,
            color: 'from-indigo-500 to-indigo-600',
        },
        {
            label: 'Comprar Tokens',
            href: '/tokens',
            icon: CreditCard,
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            label: 'Mi Perfil',
            href: '/student/profile',
            icon: User,
            color: 'from-purple-500 to-purple-600',
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

    // Countdown state
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000); // update every 30s
        return () => clearInterval(interval);
    }, []);

    const getCountdown = (scheduledAt: string) => {
        const target = new Date(scheduledAt);
        const diffMs = target.getTime() - now.getTime();
        const totalMinutes = Math.floor(diffMs / 60000);

        if (totalMinutes < 0) return { text: 'Ha comenzado', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
        if (totalMinutes === 0) return { text: 'Ahora', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
        if (totalMinutes < 60) return { text: `En ${totalMinutes} min`, urgent: true, className: 'text-orange-600 bg-orange-50' };
        if (totalMinutes < 1440) { // less than 24h
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return { text: mins > 0 ? `En ${hours}h ${mins}min` : `En ${hours}h`, urgent: hours < 2, className: hours < 2 ? 'text-orange-600 bg-orange-50' : 'text-indigo-600 bg-indigo-50' };
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
                        <span className="h-5 w-5 text-red-600 shrink-0">!</span>
                        <p className="text-red-800 text-sm">{flash.error}</p>
                    </div>
                )}

                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
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
                            <p className="text-indigo-100 text-lg">
                                Continúa tu camino de aprendizaje. ¡Tienes sesiones por venir!
                            </p>
                        </div>
                        <div className="hidden md:block text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                            <p className="text-indigo-200 text-sm font-medium">Tokens Disponibles</p>
                            <p className="text-4xl font-bold">{tokenBalance}</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className={`h-14 w-14 rounded-xl ${stat.lightColor} flex items-center justify-center shrink-0`}>
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
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                Próximas Sesiones
                            </h2>
                            <a
                                href="/student/sessions"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                Ver todas
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                        {upcomingSessions.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No tienes sesiones programadas</p>
                                <a
                                    href="/student/find-tutors"
                                    className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Buscar tutores
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingSessions.slice(0, 5).map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors duration-200 group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {session.title}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {session.tutor_profile?.user?.name}
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
                                                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors animate-pulse"
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
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                Reseñas Recientes
                            </h2>
                            <a
                                href="/student/sessions"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                Ver todas
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                        {recentReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Aún no has dejado reseñas</p>
                                <p className="text-xs text-gray-400 mt-1">Deja una reseña al completar una sesión</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentReviews.slice(0, 5).map((review) => (
                                    <div
                                        key={review.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <Star className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {review.tutor_profile?.user?.name || 'Tutor'}
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${
                                                            i < review.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            {review.comment && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">{review.comment}</p>
                                            )}
                                        </div>
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

                {/* Activity Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        Actividad Mensual
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
                                <Area type="monotone" dataKey="tokens" name="Tokens Gastados" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                                <Bar dataKey="sesiones" name="Sesiones" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                            Sin datos de actividad aún. Programa tus primeras tutorías para ver tus estadísticas.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

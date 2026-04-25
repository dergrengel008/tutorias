import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    Users,
    GraduationCap,
    Clock,
    DollarSign,
    CreditCard,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    Shield,
    ChevronRight,
    BarChart as BarChartIcon,
    FileText,
    Banknote,
} from 'lucide-react';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

interface PageProps {
    stats?: Record<string, any>;
    pendingTutors?: any[];
    recentTutors?: any[];
    recentSessions?: any[];
    monthlyRevenue?: { month: string; tokens: number; sessions: number }[];
    userGrowth?: { month: string; tutores: number; estudiantes: number }[];
    sessionsByStatus?: { estado: string; cantidad: number }[];
}

export default function AdminDashboard({ stats, pendingTutors, recentTutors, recentSessions, monthlyRevenue, userGrowth, sessionsByStatus }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    // Safe access with defaults
    const s = stats || {};
    const tutors = pendingTutors || recentTutors || [];
    const sessions = recentSessions || [];
    const chartRevenue = monthlyRevenue || [];
    const chartGrowth = userGrowth || [];
    const chartStatus = sessionsByStatus || [];

    const totalRevenue = s.totalRevenue ?? s.total_revenue ?? 0;
    const totalTokensSold = s.totalTokensTraded ?? s.total_tokens_sold ?? 0;
    const activeSessions = s.completedSessions ?? s.active_sessions ?? 0;

    const statCards = [
        {
            label: 'Total Usuarios',
            value: s.totalUsers ?? s.total_users ?? 0,
            icon: Users,
            color: 'bg-blue-50 text-blue-700',
            iconBg: 'bg-blue-500',
        },
        {
            label: 'Total Tutores',
            value: s.totalTutors ?? s.total_tutors ?? 0,
            icon: GraduationCap,
            color: 'bg-indigo-50 text-indigo-700',
            iconBg: 'bg-indigo-500',
        },
        {
            label: 'Aprobaciones Pendientes',
            value: s.pendingTutors ?? s.pending_tutors ?? 0,
            icon: AlertTriangle,
            color: 'bg-yellow-50 text-yellow-700',
            iconBg: 'bg-yellow-500',
        },
        {
            label: 'Pagos Pendientes',
            value: s.pendingPayments ?? s.pending_payments ?? 0,
            icon: Banknote,
            color: 'bg-orange-50 text-orange-700',
            iconBg: 'bg-orange-500',
        },
        {
            label: 'Sesiones Activas',
            value: activeSessions,
            icon: Clock,
            color: 'bg-emerald-50 text-emerald-700',
            iconBg: 'bg-emerald-500',
        },
        {
            label: 'Tokens Vendidos',
            value: totalTokensSold,
            icon: CreditCard,
            color: 'bg-purple-50 text-purple-700',
            iconBg: 'bg-purple-500',
        },
        {
            label: 'Ingresos',
            value: `$${Number(totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-50 text-green-700',
            iconBg: 'bg-green-500',
        },
    ];

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    const handleApprove = (tutorId: number) => {
        if (confirm('¿Estás seguro de que deseas aprobar a este tutor?')) {
            router.post(`/admin/tutors/${tutorId}/approve`);
        }
    };

    const handleReject = (tutorId: number) => {
        const reason = prompt('Ingresa el motivo del rechazo:');
        if (reason) {
            router.post(`/admin/tutors/${tutorId}/reject`, { reason });
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            scheduled: 'Programada',
            in_progress: 'En Progreso',
            completed: 'Completada',
            cancelled: 'Cancelada',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout>
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

                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-gray-500 mt-1">Gestiona tu plataforma de tutorías</p>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resumen General</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Gestión y Actividad</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Approvals */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-yellow-500" />
                                Aprobaciones Pendientes
                            </h2>
                            <a
                                href="/admin/tutors/pending"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                Ver todas
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                        {tutors.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                                <p className="text-gray-500">No hay tutores pendientes de aprobación</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tutors.slice(0, 5).map((tutor: any) => (
                                    <div
                                        key={tutor.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-100 hover:border-yellow-200 transition-colors duration-200"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {tutor.user?.avatar ? (
                                                <img
                                                    src={tutor.user.avatar}
                                                    alt={tutor.user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-indigo-600 font-bold text-lg">
                                                    {tutor.user?.name?.charAt(0) || 'T'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {tutor.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {tutor.user?.email}
                                            </p>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {tutor.specialties?.map((s: any) => (
                                                    <span
                                                        key={s.id}
                                                        className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                                                    >
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleApprove(tutor.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="hidden lg:inline">Aprobar</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(tutor.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <span className="hidden lg:inline">Rechazar</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Sessions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                Sesiones Recientes
                            </h2>
                            <a
                                href="/admin/sessions"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                Ver todas
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                        {sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No hay sesiones recientes</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessions.slice(0, 5).map((session: any) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {session.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {session.tutor_profile?.user?.name || session.tutorProfile?.user?.name} → {session.student?.name}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {statusBadge(session.status)}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {session.scheduled_at
                                                    ? formatDate(session.scheduled_at)
                                                    : session.created_at ? formatDate(session.created_at) : '—'}
                                            </p>
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tokens & Sessions Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <BarChartIcon className="h-4 w-4 text-indigo-500" />
                            Tokens Vendidos y Sesiones Completadas
                        </h2>
                        {chartRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                    />
                                    <Bar dataKey="tokens" name="Tokens" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="sessions" name="Sesiones" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                                Sin datos para mostrar
                            </div>
                        )}
                    </div>

                    {/* User Growth Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            Crecimiento de Usuarios
                        </h2>
                        {chartGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                    />
                                    <Area type="monotone" dataKey="tutores" name="Tutores" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                                    <Area type="monotone" dataKey="estudiantes" name="Estudiantes" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                                Sin datos para mostrar
                            </div>
                        )}
                    </div>
                </div>

                {/* Sessions by Status - Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <BarChartIcon className="h-4 w-4 text-purple-500" />
                        Sesiones por Estado
                    </h2>
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {chartStatus.some(d => d.cantidad > 0) ? (
                            <>
                                <ResponsiveContainer width="100%" height={220} className="lg:w-1/2">
                                    <PieChart>
                                        <Pie
                                            data={chartStatus.filter(d => d.cantidad > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            dataKey="cantidad"
                                            nameKey="estado"
                                            paddingAngle={3}
                                            label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {chartStatus.map((_, index) => (
                                                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-3 justify-center lg:flex-col lg:items-start">
                                    {chartStatus.map((item, i) => (
                                        <div key={item.estado} className="flex items-center gap-2 text-sm">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                            <span className="text-gray-600">{item.estado}: <strong>{item.cantidad}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[220px] w-full flex items-center justify-center text-gray-400 text-sm">
                                Sin sesiones registradas
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

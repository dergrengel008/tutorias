import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users,
    GraduationCap,
    Calendar,
    DollarSign,
    Download,
    TrendingUp,
    Trophy,
    Medal,
    Award,
} from 'lucide-react';
import StarRating from '@/Components/StarRating';

/* ------------------------------------------------------------------ */
/*  Native Bar Chart – Ingresos Mensuales                              */
/* ------------------------------------------------------------------ */
function MonthlyBarChart({ data }: { data: { month: string; revenue: number; tokens_used: number }[] }) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Ingresos Mensuales</h2>
                <p className="text-sm text-gray-400 mb-6">Ingresos y tokens usados por mes</p>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <TrendingUp className="h-12 w-12 mb-3" />
                    <p className="font-medium">No hay datos disponibles</p>
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const maxTokens = Math.max(...data.map((d) => d.tokens_used), 1);
    // Use the larger of the two scales so both series fit
    const maxVal = Math.max(maxRevenue, maxTokens);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ingresos Mensuales</h2>
            <p className="text-sm text-gray-400 mb-6">Ingresos y tokens usados por mes</p>

            {/* Legend */}
            <div className="flex items-center gap-5 mb-6">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} />
                    <span className="text-xs text-gray-600 font-medium">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#6366f1' }} />
                    <span className="text-xs text-gray-600 font-medium">Tokens Usados</span>
                </div>
            </div>

            {/* Chart area */}
            <div className="relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: 220 }}>
                    {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                        <div key={pct} className="border-b border-dashed border-gray-100 w-full" />
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none -ml-1 text-[10px] text-gray-400" style={{ height: 220 }}>
                    <span>{maxVal.toLocaleString()}</span>
                    <span>{(maxVal * 0.75).toLocaleString()}</span>
                    <span>{(maxVal * 0.5).toLocaleString()}</span>
                    <span>{(maxVal * 0.25).toLocaleString()}</span>
                    <span>0</span>
                </div>

                {/* Bars */}
                <div className="flex items-end justify-around gap-1 ml-8" style={{ height: 220 }}>
                    {data.map((item) => {
                        const revH = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
                        const tokH = maxVal > 0 ? (item.tokens_used / maxVal) * 100 : 0;
                        return (
                            <div key={item.month} className="flex-1 flex items-end justify-center gap-0.5">
                                {/* Revenue bar */}
                                <div className="relative flex-1 max-w-[24px] group">
                                    <div
                                        className="w-full rounded-t-md transition-all duration-300"
                                        style={{
                                            height: `${Math.max(revH, 1)}%`,
                                            minHeight: revH > 0 ? 4 : 0,
                                            backgroundColor: '#10b981',
                                        }}
                                    />
                                    {/* Tooltip */}
                                    {item.revenue > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${item.revenue.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                {/* Tokens bar */}
                                <div className="relative flex-1 max-w-[24px] group">
                                    <div
                                        className="w-full rounded-t-md transition-all duration-300"
                                        style={{
                                            height: `${Math.max(tokH, 1)}%`,
                                            minHeight: tokH > 0 ? 4 : 0,
                                            backgroundColor: '#6366f1',
                                        }}
                                    />
                                    {item.tokens_used > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {item.tokens_used.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-around ml-8 mt-2">
                {data.map((item) => (
                    <div key={item.month} className="flex-1 text-center text-[11px] text-gray-500 truncate">
                        {item.month}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Native Donut Chart – Distribución de Sesiones                       */
/* ------------------------------------------------------------------ */
function SessionDonutChart({
    data,
    statusColors,
    pieColors,
}: {
    data: { name: string; value: number; status: string }[];
    statusColors: Record<string, string>;
    pieColors: string[];
}) {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Distribución de Sesiones</h2>
                <p className="text-sm text-gray-400 mb-6">Sesiones por estado</p>
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Calendar className="h-12 w-12 mb-3" />
                    <p className="font-medium">No hay datos disponibles</p>
                </div>
            </div>
        );
    }

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = 120;
    const cy = 120;
    const outerR = 110;
    const innerR = 65;
    const circumference = 2 * Math.PI * ((outerR + innerR) / 2); // average radius for stroke technique

    let accumulated = 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Distribución de Sesiones</h2>
            <p className="text-sm text-gray-400 mb-6">Sesiones por estado</p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* SVG Donut */}
                <div className="shrink-0">
                    <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
                        {data.map((entry, idx) => {
                            const pct = total > 0 ? entry.value / total : 0;
                            const dashLen = pct * circumference;
                            const gapLen = circumference - dashLen;
                            const offset = -(accumulated * circumference);
                            accumulated += pct;
                            const color = statusColors[entry.status] || pieColors[idx % pieColors.length];

                            return (
                                <circle
                                    key={idx}
                                    cx={cx}
                                    cy={cy}
                                    r={(outerR + innerR) / 2}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={outerR - innerR}
                                    strokeDasharray={`${dashLen} ${gapLen}`}
                                    strokeDashoffset={offset}
                                    strokeLinecap="butt"
                                />
                            );
                        })}
                        {/* Center label */}
                        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-800" fontSize="26" fontWeight="700">
                            {total}
                        </text>
                        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-gray-400" fontSize="12" fontWeight="500">
                            Sesiones
                        </text>
                    </svg>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 min-w-[160px]">
                    {data.map((entry, idx) => {
                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
                        const color = statusColors[entry.status] || pieColors[idx % pieColors.length];
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                                        <span className="text-sm font-semibold text-gray-900">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-400">{entry.value} sesiones</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Interfaces                                                          */
/* ------------------------------------------------------------------ */

interface MonthlyRevenue {
    month: string;
    revenue: number;
    tokens_used: number;
    active_students: number;
}

interface TutorProfile {
    id: number;
    user?: {
        id: number;
        name: string;
        avatar?: string;
    };
    name?: string;
    avatar?: string;
    rating?: number;
    sessions_count?: number;
    specialties?: { id: number; name: string }[];
}

interface SessionStat {
    status: string;
    count: number;
    total_tokens: number;
}

interface RecentActivity {
    new_students: number;
    new_tutors: number;
    completed_sessions: number;
    total_revenue_30d: number;
}

interface PageProps {
    monthlyRevenue?: MonthlyRevenue[];
    topTutors?: TutorProfile[];
    sessionStats?: SessionStat[];
    recentActivity?: RecentActivity;
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: '#3b82f6',     // blue-500
    completed: '#10b981',     // emerald-500
    cancelled: '#ef4444',     // red-500
    in_progress: '#f59e0b',   // amber-500
};

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Programadas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
    in_progress: 'En Progreso',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

export default function Reports() {
    const { props } = usePage();
    const recentActivity = (props.recentActivity as RecentActivity) || {
        new_students: 0,
        new_tutors: 0,
        completed_sessions: 0,
        total_revenue_30d: 0,
    };
    const monthlyRevenue: MonthlyRevenue[] = (props.monthlyRevenue as MonthlyRevenue[]) || [];
    const topTutors: TutorProfile[] = (props.topTutors as TutorProfile[]) || [];
    const sessionStats: SessionStat[] = (props.sessionStats as SessionStat[]) || [];

    // Prepare pie chart data
    const pieData = sessionStats.map((stat) => ({
        name: STATUS_LABELS[stat.status] || stat.status,
        value: stat.count,
        status: stat.status,
    }));

    const activityCards = [
        {
            label: 'Nuevos Estudiantes',
            subtitle: '(30 días)',
            value: recentActivity.new_students,
            icon: Users,
            color: 'bg-blue-50 text-blue-700',
            iconBg: 'bg-blue-500',
        },
        {
            label: 'Nuevos Tutores',
            subtitle: '(30 días)',
            value: recentActivity.new_tutors,
            icon: GraduationCap,
            color: 'bg-indigo-50 text-indigo-700',
            iconBg: 'bg-indigo-500',
        },
        {
            label: 'Sesiones Completadas',
            subtitle: '(30 días)',
            value: recentActivity.completed_sessions,
            icon: Calendar,
            color: 'bg-emerald-50 text-emerald-700',
            iconBg: 'bg-emerald-500',
        },
        {
            label: 'Ingresos',
            subtitle: '(30 días)',
            value: `$${Number(recentActivity.total_revenue_30d || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-50 text-green-700',
            iconBg: 'bg-green-500',
        },
    ];

    const getRankBadge = (index: number) => {
        if (index === 0) {
            return (
                <div className="flex items-center gap-1">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        #1
                    </span>
                </div>
            );
        }
        if (index === 1) {
            return (
                <div className="flex items-center gap-1">
                    <Medal className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        #2
                    </span>
                </div>
            );
        }
        if (index === 2) {
            return (
                <div className="flex items-center gap-1">
                    <Award className="h-5 w-5 text-amber-700" />
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        #3
                    </span>
                </div>
            );
        }
        return (
            <span className="text-sm font-semibold text-gray-400">
                #{index + 1}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="h-8 w-8 text-indigo-500" />
                            Reportes y Estadísticas
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Vista general del rendimiento financiero y actividad de la plataforma
                        </p>
                    </div>
                    <a
                        href="/admin/export/sessions"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Exportar Datos
                    </a>
                </div>

                {/* Activity Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activityCards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                {card.label}{' '}
                                <span className="text-gray-400 text-xs">{card.subtitle}</span>
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <MonthlyBarChart data={monthlyRevenue} />
                    <SessionDonutChart
                        data={pieData}
                        statusColors={STATUS_COLORS}
                        pieColors={PIE_COLORS}
                    />
                </div>

                {/* Top Tutores Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            Top 10 Tutores
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Tutores con más sesiones completadas
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 w-20">
                                        Ranking
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Tutor
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Calificación
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Sesiones
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Especialidades
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topTutors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400">
                                            No hay datos de tutores disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    topTutors.map((tutor, index) => {
                                        const tutorName = tutor.user?.name || tutor.name || 'Tutor';
                                        const tutorAvatar = tutor.user?.avatar || tutor.avatar;
                                        return (
                                            <tr
                                                key={tutor.id}
                                                className={`hover:bg-gray-50 transition-colors ${
                                                    index < 3 ? 'bg-amber-50/30' : ''
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    {getRankBadge(index)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {tutorAvatar ? (
                                                                <img
                                                                    src={tutorAvatar}
                                                                    alt={tutorName}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-indigo-600 font-bold">
                                                                    {tutorName.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-900 text-sm truncate">
                                                            {tutorName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 hidden sm:table-cell">
                                                    <StarRating
                                                        rating={tutor.rating || 0}
                                                        size="sm"
                                                        showValue={true}
                                                    />
                                                </td>
                                                <td className="py-3 px-4 text-center hidden sm:table-cell">
                                                    <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                        {tutor.sessions_count || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {tutor.specialties?.map((spec) => (
                                                            <span
                                                                key={spec.id}
                                                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                                                            >
                                                                {spec.name}
                                                            </span>
                                                        ))}
                                                        {(!tutor.specialties || tutor.specialties.length === 0) && (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

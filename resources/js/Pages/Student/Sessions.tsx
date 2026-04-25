import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Calendar as CalendarIcon, Clock, Play, Eye, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight, Timer, LayoutList } from 'lucide-react';
import { useCountdown } from '@/Hooks/useCountdown';
import SessionCalendar from '@/Components/SessionCalendar';

interface TutoringSession {
    id: number;
    title: string;
    status: string;
    scheduled_at?: string;
    ended_at?: string;
    duration_minutes?: number;
    token_cost?: number;
    tutor_profile?: { id: number; user?: { name: string; avatar?: string }; hourly_rate?: number };
    description?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse {
    data: TutoringSession[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface PageProps {
    upcomingSessions: TutoringSession[];
    pastSessions: PaginatedResponse;
}

const FILTERS = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const;
const FILTER_LABELS: Record<string, string> = {
    all: 'Todas', scheduled: 'Programadas', in_progress: 'En Progreso', completed: 'Completadas', cancelled: 'Canceladas',
};

const statusBadge = (status: string) => {
    const s: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-800', in_progress: 'bg-green-100 text-green-800', completed: 'bg-gray-100 text-gray-800', cancelled: 'bg-red-100 text-red-800' };
    const l: Record<string, string> = { scheduled: 'Programada', in_progress: 'En Progreso', completed: 'Completada', cancelled: 'Cancelada' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s[status] || 'bg-gray-100'}`}>{l[status] || status}</span>;
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── SessionCard: separate component so useCountdown runs at top level ────
function StudentSessionCard({ session }: { session: TutoringSession }) {
    const cd = useCountdown(session.scheduled_at);

    return (
        <div key={session.id} className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    {session.status === 'in_progress' ? <Play className="h-6 w-6 animate-pulse" /> : session.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : session.status === 'cancelled' ? <XCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                    <p className="text-sm text-gray-500">{session.tutor_profile?.user?.name || 'Tutor'}</p>
                    <p className="text-xs text-gray-400">{session.scheduled_at ? formatDate(session.scheduled_at) : ''}{session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {session.token_cost && <span className="text-sm font-medium text-gray-500">{session.token_cost} tk</span>}
                    {/* Countdown badge for scheduled sessions */}
                    {session.status === 'scheduled' && cd.text && (
                        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cd.className}`}>
                            <Timer className="h-3 w-3" />
                            {cd.text}
                        </span>
                    )}
                    {/* Live badge for in_progress sessions */}
                    {session.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white animate-pulse">
                            <Play className="h-3 w-3" />
                            En vivo
                        </span>
                    )}
                    {statusBadge(session.status)}
                    {session.status === 'in_progress' && (
                        <a href={`/whiteboard/${session.id}`} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors">
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">Unirse</span>
                        </a>
                    )}
                    <Link href={`/sessions/${session.id}`} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><Eye className="h-5 w-5" /></Link>
                </div>
            </div>
        </div>
    );
}

export default function StudentSessions({ upcomingSessions, pastSessions }: PageProps) {
    const [filter, setFilter] = useState<string>('all');
    const [view, setView] = useState<'list' | 'calendar'>('list');

    // Merge upcoming (no pagination) with past (paginated) sessions
    const pastData = pastSessions?.data || (pastSessions as any)?.data || [];
    const allSessions = [...upcomingSessions, ...pastData];
    const filtered = filter === 'all' ? allSessions : allSessions.filter((s: TutoringSession) => s.status === filter);

    const handlePageChange = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    // Pagination info
    const currentPage = pastSessions?.current_page || 1;
    const lastPage = pastSessions?.last_page || 1;
    const totalPages = pastSessions?.total || 0;

    // Countdown for the nearest scheduled session
    const nextScheduled = allSessions.find((s: TutoringSession) => s.status === 'scheduled' && s.scheduled_at);
    const countdown = useCountdown(nextScheduled?.scheduled_at);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Global countdown banner */}
                {countdown.text && countdown.urgent && nextScheduled && (
                    <div className={`rounded-xl ${countdown.className} border px-4 py-3 flex items-center gap-3 animate-pulse`}>
                        <Timer className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">{nextScheduled.title}</p>
                            <p className="text-xs opacity-80">{countdown.text}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CalendarIcon className="h-7 w-7 text-indigo-500" /> Mis Sesiones</h1>
                        <p className="text-gray-500 mt-1">{totalPages} sesión{totalPages !== 1 ? 'es' : ''} en total</p>
                    </div>
                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vista de lista"
                        >
                            <LayoutList className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Vista de calendario"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Filter bar (only in list view) */}
                {view === 'list' && (
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400" />
                        {FILTERS.map((f) => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {FILTER_LABELS[f]}
                            </button>
                        ))}
                    </div>
                </div>
                )}

                {view === 'calendar' ? (
                    <SessionCalendar
                        sessions={allSessions.filter((s) => s.scheduled_at)}
                        onEventClick={(id) => router.visit(`/sessions/${id}`)}
                    />
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin sesiones</h3>
                        <p className="text-gray-500">{filter === 'all' ? 'Aún no tienes sesiones.' : `No hay sesiones "${FILTER_LABELS[filter].toLowerCase()}".`}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {filtered.map((session: TutoringSession) => (
                                <StudentSessionCard key={session.id} session={session} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div className="bg-white rounded-xl shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Página {currentPage} de {lastPage}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {pastSessions?.links?.map((link: PaginationLink, index: number) => {
                                            if (!link.url) return null;
                                            const isPrev = link.label === '&laquo; Previous';
                                            const isNext = link.label === 'Next &raquo;';
                                            const isPrevEs = link.label.includes('Anterior') || link.label.includes('Previous') || link.label.includes('«');
                                            const isNextEs = link.label.includes('Siguiente') || link.label.includes('Next') || link.label.includes('»');

                                            if (index === 0 || index === pastSessions.links.length - 1) {
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(link.url!)}
                                                        disabled={currentPage === (isPrev || isPrevEs ? 1 : lastPage)}
                                                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === (isPrev || isPrevEs ? 1 : lastPage)
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-700 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700'
                                                        }`}
                                                    >
                                                        {isPrev || isPrevEs ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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

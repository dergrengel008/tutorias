import { useState, useMemo } from 'react';

interface CalendarEvent {
    id: number;
    title: string;
    scheduled_at: string;
    status: string;
    duration_minutes?: number;
}

interface SessionCalendarProps {
    sessions: CalendarEvent[];
    onEventClick?: (sessionId: number) => void;
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-emerald-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-400',
};

const STATUS_DOTS: Record<string, string> = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-emerald-500 animate-pulse',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-400',
};

export default function SessionCalendar({ sessions, onEventClick }: SessionCalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Normalize sessions and group by date string "YYYY-MM-DD"
    const sessionsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        sessions.forEach((s) => {
            if (!s.scheduled_at) return;
            const dateStr = s.scheduled_at.slice(0, 10);
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(s);
        });
        return map;
    }, [sessions]);

    // Selected day's sessions
    const selectedSessions = useMemo(() => {
        if (!selectedDate) return [];
        return sessionsByDate[selectedDate] || [];
    }, [selectedDate, sessionsByDate]);

    // Calendar grid math
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    // getDay() returns 0=Sun...6=Sat. We want Mon=0.
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6; // Sunday wraps to 6

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setSelectedDate(todayStr);
    };

    // Build the grid cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h2 className="text-lg font-bold text-white">{MONTHS[currentMonth]} {currentYear}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-5 py-2 bg-gray-50 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Programada</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> En Progreso</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" /> Completada</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Cancelada</span>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-gray-50 bg-gray-50/50" />;
                    }
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySessions = sessionsByDate[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    return (
                        <div
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`min-h-[80px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition-colors ${
                                isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${
                                    isToday
                                        ? 'bg-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs'
                                        : 'text-gray-700'
                                }`}>
                                    {day}
                                </span>
                                {daySessions.length > 0 && (
                                    <span className="text-[10px] text-gray-400">{daySessions.length}</span>
                                )}
                            </div>

                            {/* Session dots */}
                            <div className="space-y-0.5">
                                {daySessions.slice(0, 3).map((s) => (
                                    <div
                                        key={s.id}
                                        className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${STATUS_COLORS[s.status]} text-white font-medium`}
                                    >
                                        {new Date(s.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} {s.title}
                                    </div>
                                ))}
                                {daySessions.length > 3 && (
                                    <div className="text-[10px] text-gray-400 px-1">+{daySessions.length - 3} más</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected day detail panel */}
            {selectedDate && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700">
                            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long', day: 'numeric', month: 'long',
                            })}
                        </h3>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Cerrar
                        </button>
                    </div>

                    {selectedSessions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hay sesiones programadas para este día.</p>
                    ) : (
                        <div className="space-y-2">
                            {selectedSessions.map((s) => (
                                <div
                                    key={s.id}
                                    onClick={() => onEventClick?.(s.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${onEventClick ? 'hover:border-indigo-300' : ''}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${STATUS_DOTS[s.status]}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(s.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                        s.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                        s.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700' :
                                        s.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {s.status === 'scheduled' ? 'Programada' :
                                         s.status === 'in_progress' ? 'En Progreso' :
                                         s.status === 'completed' ? 'Completada' : 'Cancelada'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

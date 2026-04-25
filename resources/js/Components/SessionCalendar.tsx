import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface Session {
    id: number;
    title: string;
    status: string;
    scheduled_at: string;
}

interface SessionCalendarProps {
    sessions: Session[];
    onEventClick?: (id: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-50 text-red-400 border-red-100 line-through',
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function SessionCalendar({ sessions, onEventClick }: SessionCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Build a map of day -> sessions for quick lookup
    const sessionsByDay: Record<number, Session[]> = {};
    sessions.forEach((session) => {
        if (session.scheduled_at) {
            const date = new Date(session.scheduled_at);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const day = date.getDate();
                if (!sessionsByDay[day]) sessionsByDay[day] = [];
                sessionsByDay[day].push(session);
            }
        }
    });

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    // Build calendar cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const isToday = (day: number) =>
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-500" />
                    Calendario
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">
                        {MONTHS[currentMonth]} {currentYear}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 uppercase py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                    if (day === null) {
                        return <div key={`empty-${idx}`} className="h-24" />;
                    }

                    const daySessions = sessionsByDay[day] || [];
                    const todayHighlight = isToday(day);

                    return (
                        <div
                            key={day}
                            className={`h-24 border rounded-lg p-1.5 overflow-hidden transition-colors ${
                                todayHighlight
                                    ? 'border-indigo-300 bg-indigo-50/50'
                                    : 'border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            <span
                                className={`text-xs font-semibold inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                    todayHighlight
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600'
                                }`}
                            >
                                {day}
                            </span>
                            <div className="mt-0.5 space-y-0.5">
                                {daySessions.slice(0, 2).map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => onEventClick?.(session.id)}
                                        className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                            STATUS_COLORS[session.status] || 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}
                                        title={session.title}
                                    >
                                        {session.title}
                                    </button>
                                ))}
                                {daySessions.length > 2 && (
                                    <span className="text-[10px] text-gray-400 px-1">
                                        +{daySessions.length - 2} mas
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

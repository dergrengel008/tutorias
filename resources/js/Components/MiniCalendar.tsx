import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
    date: string; // ISO date string like "2025-01-15"
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    title?: string;
}

interface MiniCalendarProps {
    events?: CalendarEvent[];
    onDateClick?: (date: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-emerald-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-400',
};

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday=0 to Monday-based (0=Mon, 6=Sun)
    return day === 0 ? 6 : day - 1;
}

function toDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MiniCalendar({ events = [], onDateClick }: MiniCalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    // Build a map of dateKey -> events for quick lookup
    const eventMap = new Map<string, CalendarEvent[]>();
    events.forEach((evt) => {
        const key = evt.date?.split('T')[0] || evt.date;
        if (!eventMap.has(key)) eventMap.set(key, []);
        eventMap.get(key)!.push(evt);
    });

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const goToPrev = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNext = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    // Check if a date is today
    const isToday = (day: number) => {
        return (
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth() &&
            day === today.getDate()
        );
    };

    // Build calendar cells
    const cells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const m = currentMonth === 0 ? 11 : currentMonth - 1;
        const y = currentMonth === 0 ? currentYear - 1 : currentYear;
        cells.push({ day, isCurrentMonth: false, dateKey: toDateKey(y, m, day) });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, isCurrentMonth: true, dateKey: toDateKey(currentYear, currentMonth, day) });
    }

    // Next month leading days (fill to 6 rows = 42 cells)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
        const m = currentMonth === 11 ? 0 : currentMonth + 1;
        const y = currentMonth === 11 ? currentYear + 1 : currentYear;
        cells.push({ day, isCurrentMonth: false, dateKey: toDateKey(y, m, day) });
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={goToPrev}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </button>
                </div>
                <button
                    onClick={goToNext}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((name) => (
                    <div key={name} className="text-center text-[11px] font-medium text-gray-400 py-1">
                        {name}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((cell, i) => {
                    const dayEvents = eventMap.get(cell.dateKey) || [];
                    const hasEvents = dayEvents.length > 0;
                    const todayClass = isToday(cell.day) && cell.isCurrentMonth;

                    return (
                        <button
                            key={i}
                            onClick={() => hasEvents && onDateClick?.(cell.dateKey)}
                            className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-sm transition-colors ${
                                cell.isCurrentMonth
                                    ? todayClass
                                        ? 'bg-indigo-600 text-white font-bold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    : 'text-gray-300'
                            } ${hasEvents && cell.isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <span className="leading-none">{cell.day}</span>
                            {/* Event dots */}
                            {hasEvents && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {dayEvents.slice(0, 3).map((evt, j) => (
                                        <span
                                            key={j}
                                            className={`w-1 h-1 rounded-full ${
                                                todayClass
                                                    ? 'bg-white/80'
                                                    : STATUS_COLORS[evt.status] || 'bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                {Object.entries(STATUS_COLORS).map(([status, color]) => {
                    const labels: Record<string, string> = {
                        scheduled: 'Programada',
                        in_progress: 'En progreso',
                        completed: 'Completada',
                        cancelled: 'Cancelada',
                    };
                    return (
                        <div key={status} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${color}`} />
                            <span className="text-[10px] text-gray-500">{labels[status]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

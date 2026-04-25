import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Clock, Calendar, ChevronRight, Timer } from 'lucide-react';

interface NextSessionData {
    id: number;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    tutor_profile?: { user?: { name: string } };
    student?: { name: string };
}

interface Props {
    session: NextSessionData | null;
    label?: string; // "Tutor" or "Estudiante" — the other person
}

function getTimeRemaining(targetDate: string): { total: number; days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
    const total = new Date(targetDate).getTime() - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor(total / 1000 / 60 / 60 / 24);
    return { total, days, hours, minutes, seconds, isPast: false };
}

export default function NextSessionCountdown({ session, label = '' }: Props) {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(session?.scheduled_at || ''));

    useEffect(() => {
        if (!session?.scheduled_at) return;
        const interval = setInterval(() => {
            setTimeLeft(getTimeRemaining(session.scheduled_at));
        }, 1000);
        return () => clearInterval(interval);
    }, [session?.scheduled_at]);

    if (!session || timeLeft.isPast) return null;

    const otherPerson = label === 'Tutor'
        ? session.tutor_profile?.user?.name
        : session.student?.name;

    const scheduledDate = new Date(session.scheduled_at).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    const isUrgent = timeLeft.total < 60 * 60 * 1000; // less than 1 hour

    return (
        <div
            className={`rounded-xl p-5 border transition-all ${
                isUrgent
                    ? 'bg-amber-50 border-amber-200 shadow-md shadow-amber-100'
                    : 'bg-white border-gray-100 shadow-sm'
            }`}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isUrgent ? 'bg-amber-500 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                    <Timer className={`h-5 w-5 ${isUrgent ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                    <h3 className={`text-sm font-bold ${isUrgent ? 'text-amber-800' : 'text-gray-900'}`}>
                        {isUrgent ? 'Tu sesión comienza pronto!' : 'Próxima Sesión'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {scheduledDate}
                    </p>
                </div>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                    { value: timeLeft.days, label: 'Días' },
                    { value: timeLeft.hours, label: 'Horas' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Seg' },
                ].map((unit) => (
                    <div
                        key={unit.label}
                        className={`text-center rounded-lg py-2 px-1 ${
                            isUrgent
                                ? 'bg-amber-100'
                                : 'bg-gray-50'
                        }`}
                    >
                        <p className={`text-xl font-bold tabular-nums ${
                            isUrgent ? 'text-amber-700' : 'text-gray-900'
                        }`}>
                            {String(unit.value).padStart(2, '0')}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">{unit.label}</p>
                    </div>
                ))}
            </div>

            {/* Session info */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                    {otherPerson && label && (
                        <p className="text-xs text-gray-500">
                            {label}: {otherPerson}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {session.duration_minutes} minutos
                    </p>
                </div>
                <Link
                    href={`/sessions/${session.id}`}
                    className={`shrink-ml-3 ml-3 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isUrgent
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    Ver
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}

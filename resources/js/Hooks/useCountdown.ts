import { useState, useEffect } from 'react';

interface CountdownResult {
    text: string;
    urgent: boolean;
    className: string;
}

/**
 * Countdown hook: calculates how much time remains until a scheduled date.
 * Returns human-readable text, urgency flag, and Tailwind classes.
 * Updates every 30 seconds.
 */
export function useCountdown(scheduledAt?: string | null): CountdownResult {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    if (!scheduledAt) {
        return { text: '', urgent: false, className: '' };
    }

    const target = new Date(scheduledAt);
    const diffMs = target.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);

    if (totalMinutes < 0) {
        return { text: 'Ha comenzado', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
    }
    if (totalMinutes === 0) {
        return { text: 'Ahora', urgent: true, className: 'text-emerald-600 bg-emerald-50' };
    }
    if (totalMinutes < 60) {
        return { text: `En ${totalMinutes} min`, urgent: true, className: 'text-orange-600 bg-orange-50' };
    }
    if (totalMinutes < 1440) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return {
            text: mins > 0 ? `En ${hours}h ${mins}min` : `En ${hours}h`,
            urgent: hours < 2,
            className: hours < 2 ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50',
        };
    }

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    return {
        text: hours > 0 ? `En ${days}d ${hours}h` : `En ${days}d`,
        urgent: false,
        className: 'text-gray-600 bg-gray-50',
    };
}

interface RemainingTimeResult {
    text: string;
    expired: boolean;
}

/**
 * Remaining time hook: calculates how much time is left in an in-progress session.
 * Takes duration in minutes and the ISO start time.
 * Returns formatted HH:MM:SS string and expired flag.
 * Updates every second.
 */
export function useRemainingTime(
    durationMinutes?: number | null,
    startedAt?: string | null
): RemainingTimeResult {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!durationMinutes || !startedAt) {
        return { text: '', expired: false };
    }

    const start = new Date(startedAt).getTime();
    const totalSeconds = durationMinutes * 60;
    const elapsed = Math.floor((now.getTime() - start) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsed);

    if (remaining <= 0) {
        return { text: '00:00:00', expired: true };
    }

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const text = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return { text, expired: false };
}

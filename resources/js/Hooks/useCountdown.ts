import { useState, useEffect } from 'react';

interface CountdownResult {
    text: string;
    urgent: boolean;
    className: string;
    totalSeconds: number; // negative = already passed
}

/**
 * Returns a live countdown string for a given target date/time.
 * Updates every 30 seconds to keep the display fresh.
 *
 * @param scheduledAt - ISO date string (e.g. "2025-06-15T14:00:00")
 * @param intervalMs  - refresh interval in ms (default 30 000 = 30s)
 */
export function useCountdown(scheduledAt: string | undefined | null, intervalMs = 30000): CountdownResult {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    if (!scheduledAt) {
        return { text: '', urgent: false, className: 'text-gray-500 bg-gray-50', totalSeconds: 0 };
    }

    const target = new Date(scheduledAt);
    const diffMs = target.getTime() - now.getTime();
    const totalSeconds = Math.round(diffMs / 1000);
    const totalMinutes = Math.floor(diffMs / 60000);

    if (totalMinutes < 0) {
        return { text: 'Ha comenzado', urgent: true, className: 'text-emerald-600 bg-emerald-50', totalSeconds };
    }
    if (totalMinutes === 0) {
        return { text: 'Ahora', urgent: true, className: 'text-emerald-600 bg-emerald-50', totalSeconds };
    }
    if (totalMinutes < 60) {
        return { text: `En ${totalMinutes} min`, urgent: true, className: 'text-orange-600 bg-orange-50', totalSeconds };
    }
    if (totalMinutes < 1440) {
        // less than 24h
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return {
            text: mins > 0 ? `En ${hours}h ${mins}min` : `En ${hours}h`,
            urgent: hours < 2,
            className: hours < 2 ? 'text-orange-600 bg-orange-50' : 'text-indigo-600 bg-indigo-50',
            totalSeconds,
        };
    }
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    return {
        text: hours > 0 ? `En ${days}d ${hours}h` : `En ${days}d`,
        urgent: false,
        className: 'text-gray-600 bg-gray-50',
        totalSeconds,
    };
}

/**
 * Returns remaining time (HH:MM:SS) for an active session.
 * Uses elapsed seconds and the session duration in minutes.
 *
 * @param durationMinutes - planned session length
 * @param startedAt       - ISO string of when the session started
 */
export function useRemainingTime(durationMinutes: number | undefined | null, startedAt: string | undefined | null) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!durationMinutes || !startedAt) {
        return { text: '--:--:--', totalSeconds: 0, expired: false, elapsedSeconds: 0 };
    }

    const started = new Date(startedAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - started) / 1000));
    const totalDurationSeconds = durationMinutes * 60;
    const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
    const expired = elapsedSeconds >= totalDurationSeconds;

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const text = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return { text, totalSeconds: remaining, expired, elapsedSeconds };
}

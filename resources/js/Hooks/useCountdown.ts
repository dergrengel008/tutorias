import { useState, useEffect, useCallback, useRef } from 'react';

interface CountdownResult {
    text: string;
    expired: boolean;
}

/**
 * Countdown timer hook for tutoring sessions.
 *
 * Calculates remaining time based on session start time and duration.
 * Updates every second and cleans up on unmount.
 *
 * @param durationMinutes - Session duration in minutes (null if not set)
 * @param startedAt - ISO string of when the session started (null if not started)
 * @returns { text: "HH:MM:SS", expired: boolean }
 */
export function useRemainingTime(
    durationMinutes: number | null | undefined,
    startedAt: string | null | undefined
): CountdownResult {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const calculateRemaining = useCallback((): number => {
        if (!durationMinutes || !startedAt) {
            return 0;
        }

        const startMs = new Date(startedAt).getTime();
        const endMs = startMs + durationMinutes * 60 * 1000;
        const nowMs = Date.now();
        const remaining = Math.floor((endMs - nowMs) / 1000);

        return remaining > 0 ? remaining : 0;
    }, [durationMinutes, startedAt]);

    useEffect(() => {
        // Initial calculation
        setRemainingSeconds(calculateRemaining());

        // Set up interval to update every second
        intervalRef.current = setInterval(() => {
            setRemainingSeconds(calculateRemaining());
        }, 1000);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [calculateRemaining]);

    // Format seconds to HH:MM:SS
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const text = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const expired = remainingSeconds <= 0 && durationMinutes !== null && startedAt !== null;

    return { text, expired };
}

export default useRemainingTime;

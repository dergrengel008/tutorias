import { useState, useEffect, useCallback } from 'react';

export function useCountdown(targetDate: string | null) {
    const calculateTimeLeft = useCallback(() => {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        const difference = new Date(targetDate).getTime() - new Date().getTime();
        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
        }
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false,
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return timeLeft;
}

export function useRemainingTime(startTime: string | null, durationMinutes: number | null) {
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if (!startTime || !durationMinutes) {
            setRemaining(0);
            return;
        }

        const end = new Date(startTime).getTime() + durationMinutes * 60 * 1000;

        const update = () => {
            const diff = Math.floor((end - Date.now()) / 1000);
            setRemaining(diff > 0 ? diff : 0);
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [startTime, durationMinutes]);

    const expired = remaining <= 0;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    const text = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return { remaining, expired, hours, minutes, seconds, text };
}

export default useCountdown;

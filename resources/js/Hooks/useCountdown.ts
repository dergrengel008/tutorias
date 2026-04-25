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
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!startTime || !durationMinutes) {
            setRemaining(0);
            setIsExpired(true);
            return;
        }

        const end = new Date(startTime).getTime() + durationMinutes * 60 * 1000;

        const update = () => {
            const diff = end - Date.now();
            if (diff <= 0) {
                setRemaining(0);
                setIsExpired(true);
            } else {
                setRemaining(Math.floor(diff / 1000));
                setIsExpired(false);
            }
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [startTime, durationMinutes]);

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    return { remaining, isExpired, hours, minutes, seconds };
}

export default useCountdown;

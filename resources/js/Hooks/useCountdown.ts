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

export default useCountdown;

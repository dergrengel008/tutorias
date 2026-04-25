import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export default function NotificationBadge() {
    const { props } = usePage();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pulsing, setPulsing] = useState(false);
    const prevCount = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const user = (props.auth as { user?: unknown })?.user;

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/notifications/unread-count');
            if (!response.ok) return;
            const data = (await response.json()) as { count: number };
            setUnreadCount(data.count);
        } catch {
            // Fail silently — don't crash the UI
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchUnreadCount();

        intervalRef.current = setInterval(fetchUnreadCount, 30_000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user]);

    useEffect(() => {
        if (unreadCount > 0 && unreadCount !== prevCount.current) {
            setPulsing(true);
            const timer = setTimeout(() => setPulsing(false), 600);
            return () => clearTimeout(timer);
        }
        prevCount.current = unreadCount;
    }, [unreadCount]);

    const displayCount = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <a
            href="/notifications"
            className="relative inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <Bell className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />

            {unreadCount > 0 && (
                <span
                    className={`absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ${
                        pulsing ? 'animate-bounce' : ''
                    }`}
                >
                    {displayCount}
                </span>
            )}
        </a>
    );
}

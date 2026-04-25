import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Bell,
    CheckCircle,
    Calendar,
    Star,
    AlertTriangle,
    DollarSign,
    MessageSquare,
    GraduationCap,
    Clock,
    CheckCheck,
    X,
} from 'lucide-react';
import type { AppNotification } from '@/types';

interface PageProps {
    notifications: AppNotification[];
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
    info: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100' },
    success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    error: { icon: X, color: 'text-red-600', bg: 'bg-red-100' },
    session_reminder: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    new_review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
    token_transaction: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    profile_approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    profile_rejected: { icon: X, color: 'text-red-600', bg: 'bg-red-100' },
    new_session: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    session_completed: { icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-100' },
    warning_received: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
    message: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} d`;
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
    });
}

export default function NotificationsIndex({ notifications: initialNotifications }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const [notifications, setNotifications] = useState<AppNotification[]>(
        (props.notifications || initialNotifications) as AppNotification[]
    );
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const filteredNotifications = notifications.filter((n) => {
        if (activeFilter === 'unread') return !n.is_read;
        if (activeFilter === 'read') return n.is_read;
        return true;
    });

    const markAsRead = async (notificationId: number) => {
        try {
            await router.post(`/notifications/${notificationId}/read`, {}, {
                preserveState: true,
                preserveScroll: true,
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
            );
        } catch {
            // Error handled silently
        }
    };

    const markAllAsRead = async () => {
        try {
            await router.post('/notifications/read-all', {}, {
                preserveState: true,
                preserveScroll: true,
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch {
            // Error handled silently
        }
    };

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{flash.success}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Bell className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
                            <p className="text-gray-500 mt-0.5">
                                {unreadCount > 0
                                    ? `${unreadCount} sin leer`
                                    : 'Todas las notificaciones leídas'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-lg p-1.5 inline-flex gap-1">
                    {([
                        { key: 'all' as const, label: 'Todas' },
                        { key: 'unread' as const, label: 'No leídas' },
                        { key: 'read' as const, label: 'Leídas' },
                    ]).map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeFilter === tab.key
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {activeFilter === 'unread'
                                ? '¡Todo al día!'
                                : 'No hay notificaciones'}
                        </h3>
                        <p className="text-gray-500">
                            {activeFilter === 'unread'
                                ? 'No tienes notificaciones sin leer'
                                : 'Las notificaciones aparecerán aquí'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredNotifications.map((notification) => {
                            const config = typeConfig[notification.type] || typeConfig.info;
                            const IconComponent = config.icon;

                            return (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-start gap-4 group ${
                                        !notification.is_read
                                            ? 'border-l-4 border-indigo-500 bg-indigo-50/30'
                                            : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`h-11 w-11 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 mt-0.5`}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p
                                                    className={`text-sm ${
                                                        notification.is_read
                                                            ? 'text-gray-700'
                                                            : 'text-gray-900 font-semibold'
                                                    }`}
                                                >
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(notification.created_at)}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    {!notification.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8 rounded-lg bg-gray-100 hover:bg-indigo-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all"
                                           
                                        >
                                            <CheckCheck className="h-4 w-4" />
                                        </button>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

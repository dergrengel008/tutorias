import { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    GraduationCap,
    Calendar,
    Tag,
    MessageSquare,
    AlertTriangle,
    Shield,
    LogOut,
    Menu,
    X,
    GraduationCap as LogoIcon,
    Bell,
    Banknote,
    ChevronDown,
    Settings,
    FileText,
    Coins,
    BarChart3,
    Star,
} from 'lucide-react';
import FlashMessage from './FlashMessage';
import Avatar from './Avatar';
import type { User as UserType } from '@/types';
import { route } from '@/route';

interface AdminLayoutProps {
    children: ReactNode;
}

interface SidebarItem {
    label: string;
    icon: ReactNode;
    route: string;
    activePatterns?: string[];
}

interface SidebarGroup {
    title: string;
    items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
    {
        title: 'Principal',
        items: [
            {
                label: 'Dashboard',
                icon: <LayoutDashboard className="h-5 w-5" />,
                route: 'admin.dashboard',
                activePatterns: ['admin.dashboard'],
            },
        ],
    },
    {
        title: 'Usuarios',
        items: [
            {
                label: 'Tutores Pendientes',
                icon: <UserCheck className="h-5 w-5" />,
                route: 'admin.tutors.pending',
                activePatterns: ['admin.tutors.pending'],
            },
            {
                label: 'Todos los Tutores',
                icon: <Users className="h-5 w-5" />,
                route: 'admin.tutors.index',
                activePatterns: ['admin.tutors.index'],
            },
            {
                label: 'Estudiantes',
                icon: <GraduationCap className="h-5 w-5" />,
                route: 'admin.students.index',
                activePatterns: ['admin.students.index'],
            },
        ],
    },
    {
        title: 'Actividad',
        items: [
            {
                label: 'Sesiones',
                icon: <Calendar className="h-5 w-5" />,
                route: 'admin.sessions.index',
                activePatterns: ['admin.sessions.index'],
            },
            {
                label: 'Reseñas',
                icon: <Star className="h-5 w-5" />,
                route: 'admin.reviews.index',
                activePatterns: ['admin.reviews.index'],
            },
            {
                label: 'Amonestaciones',
                icon: <AlertTriangle className="h-5 w-5" />,
                route: 'admin.warnings.index',
                activePatterns: ['admin.warnings.index'],
            },
        ],
    },
    {
        title: 'Finanzas',
        items: [
            {
                label: 'Recargas Pago Móvil',
                icon: <Banknote className="h-5 w-5" />,
                route: 'admin.payment-receipts.index',
                activePatterns: ['admin.payment-receipts.index'],
            },
        ],
    },
    {
        title: 'Catálogo',
        items: [
            {
                label: 'Especialidades',
                icon: <Tag className="h-5 w-5" />,
                route: 'admin.specialties.index',
                activePatterns: ['admin.specialties.index'],
            },
        ],
    },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { props } = usePage();
    const user = (props.auth as { user: UserType | null })?.user as UserType | null;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const unreadCount = (props.unreadNotifications as number) || 0;

    const isActive = (item: SidebarItem) => {
        return item.activePatterns?.some((pattern) => route().current(pattern));
    };

    const toggleGroup = (title: string) => {
        setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    // Auto-expand group that contains active item
    const isGroupActive = (group: SidebarGroup) => {
        return group.items.some((item) => isActive(item));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <FlashMessage />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <LogoIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-gray-900">TutoriaApp</span>
                            <p className="text-xs text-gray-400 font-medium">Panel de Admin</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Admin badge */}
                <div className="mx-4 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Administrador</p>
                            <p className="text-xs text-indigo-100">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation with grouped sections */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {sidebarGroups.map((group) => {
                        const collapsed = collapsedGroups[group.title] && !isGroupActive(group);
                        const groupActive = isGroupActive(group);

                        return (
                            <div key={group.title} className="mb-2">
                                {/* Group header */}
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <span>{group.title}</span>
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                            collapsed ? '-rotate-90' : ''
                                        }`}
                                    />
                                </button>

                                {/* Group items */}
                                {!collapsed && (
                                    <ul className="space-y-0.5">
                                        {group.items.map((item) => (
                                            <li key={item.route}>
                                                <Link
                                                    href={route(item.route)}
                                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                        isActive(item)
                                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    <span
                                                        className={
                                                            isActive(item) ? 'text-indigo-600' : 'text-gray-400'
                                                        }
                                                    >
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                    {isActive(item) && (
                                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 px-2">
                        <Avatar src={user?.avatar} name={user?.name || 'Admin'} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user?.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <form onSubmit={handleLogout} className="mt-3">
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm sm:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('notifications.index')}
                            className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

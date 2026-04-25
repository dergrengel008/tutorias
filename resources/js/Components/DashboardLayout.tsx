import { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    User,
    BookOpen,
    Tag,
    Calendar,
    Users,
    DollarSign,
    Search,
    Coins,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Bell,
    ChevronDown,
    Star,
} from 'lucide-react';
import FlashMessage from './FlashMessage';
import Avatar from './Avatar';
import StarRating from './StarRating';
import type { User as UserType, TutorProfile } from '@/types';
import { route } from '@/route';

interface DashboardLayoutProps {
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

// ─── Tutor sidebar groups (4 groups) ───────────────────────────────────────
const tutorSidebarGroups: SidebarGroup[] = [
    {
        title: 'Principal',
        items: [
            {
                label: 'Dashboard',
                icon: <LayoutDashboard className="h-5 w-5" />,
                route: 'tutor.dashboard',
                activePatterns: ['tutor.dashboard'],
            },
            {
                label: 'Mi Perfil',
                icon: <User className="h-5 w-5" />,
                route: 'tutor.profile.edit',
                activePatterns: ['tutor.profile.edit'],
            },
        ],
    },
    {
        title: 'Tutoría',
        items: [
            {
                label: 'Mis Sesiones',
                icon: <Calendar className="h-5 w-5" />,
                route: 'tutor.sessions.index',
                activePatterns: ['tutor.sessions.index', 'sessions.show'],
            },
            {
                label: 'Mis Cursos',
                icon: <BookOpen className="h-5 w-5" />,
                route: 'tutor.courses.index',
                activePatterns: ['tutor.courses.index'],
            },
            {
                label: 'Mis Especialidades',
                icon: <Tag className="h-5 w-5" />,
                route: 'tutor.specialties.index',
                activePatterns: ['tutor.specialties.index'],
            },
            {
                label: 'Mis Estudiantes',
                icon: <Users className="h-5 w-5" />,
                route: 'tutor.students.index',
                activePatterns: ['tutor.students.index', 'tutor.students.show'],
            },
        ],
    },
    {
        title: 'Comunidad',
        items: [
            {
                label: 'Reseñas',
                icon: <Star className="h-5 w-5" />,
                route: 'tutor.dashboard',
                activePatterns: ['tutor.dashboard'],
            },
        ],
    },
    {
        title: 'Finanzas',
        items: [
            {
                label: 'Mis Ganancias',
                icon: <DollarSign className="h-5 w-5" />,
                route: 'tutor.earnings.index',
                activePatterns: ['tutor.earnings.index'],
            },
        ],
    },
];

// ─── Student sidebar groups (3 groups) ──────────────────────────────────────
const studentSidebarGroups: SidebarGroup[] = [
    {
        title: 'Principal',
        items: [
            {
                label: 'Dashboard',
                icon: <LayoutDashboard className="h-5 w-5" />,
                route: 'student.dashboard',
                activePatterns: ['student.dashboard'],
            },
            {
                label: 'Mi Perfil',
                icon: <User className="h-5 w-5" />,
                route: 'student.profile.edit',
                activePatterns: ['student.profile.edit'],
            },
        ],
    },
    {
        title: 'Aprendizaje',
        items: [
            {
                label: 'Buscar Tutores',
                icon: <Search className="h-5 w-5" />,
                route: 'tutors.index',
                activePatterns: ['tutors.index', 'tutors.show'],
            },
            {
                label: 'Mis Sesiones',
                icon: <Calendar className="h-5 w-5" />,
                route: 'student.sessions.index',
                activePatterns: ['student.sessions.index', 'sessions.show'],
            },
            {
                label: 'Reseñas',
                icon: <Star className="h-5 w-5" />,
                route: 'student.sessions.index',
                activePatterns: ['student.sessions.index'],
            },
        ],
    },
    {
        title: 'Finanzas',
        items: [
            {
                label: 'Mis Tokens',
                icon: <Coins className="h-5 w-5" />,
                route: 'student.tokens.index',
                activePatterns: ['student.tokens.index'],
            },
        ],
    },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { props } = usePage();
    const user = (props.auth as { user: UserType | null; role: string })?.user as UserType | null;
    const role = (props.auth as { user: UserType | null; role: string })?.role as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const isTutor = role === 'tutor';
    const sidebarGroups = isTutor ? tutorSidebarGroups : studentSidebarGroups;
    const tutorProfile = user?.tutor_profile as TutorProfile | undefined;

    const accentFrom = isTutor ? 'from-emerald-500' : 'from-blue-500';
    const accentTo = isTutor ? 'to-teal-600' : 'to-indigo-600';
    const accentBg = isTutor ? 'bg-emerald-50' : 'bg-blue-50';
    const accentText = isTutor ? 'text-emerald-700' : 'text-blue-700';
    const accentBgHover = isTutor ? 'hover:bg-emerald-50' : 'hover:bg-blue-50';
    const accentTextHover = isTutor ? 'hover:text-emerald-700' : 'hover:text-blue-700';
    const accentIcon = isTutor ? 'text-emerald-600' : 'text-blue-600';
    const accentDot = isTutor ? 'bg-emerald-500' : 'bg-blue-500';

    const isActive = (item: SidebarItem) => {
        return item.activePatterns?.some((pattern) => route().current(pattern));
    };

    const isGroupActive = (group: SidebarGroup) => {
        return group.items.some((item) => isActive(item));
    };

    const toggleGroup = (title: string) => {
        setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const roleLabel = isTutor ? 'Tutor' : 'Estudiante';
    const roleIcon = isTutor ? (
        <GraduationCap className="h-5 w-5 text-white" />
    ) : (
        <User className="h-5 w-5 text-white" />
    );

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
                    <Link
                        href={isTutor ? route('tutor.dashboard') : route('student.dashboard')}
                        className="flex items-center gap-2.5"
                    >
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo}`}
                        >
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-gray-900">TutoriaApp</span>
                            <p className="text-xs text-gray-400 font-medium capitalize">{roleLabel}</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User info card */}
                <div className="mx-4 mt-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar src={user?.avatar} name={user?.name || 'Usuario'} size="lg" />
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {user?.name}
                                </p>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${accentBg} ${accentText}`}
                                >
                                    {roleIcon}
                                    {roleLabel}
                                </span>
                            </div>
                        </div>
                        {isTutor && tutorProfile && (
                            <div className="mt-3 border-t border-gray-100 pt-3">
                                <StarRating rating={tutorProfile.average_rating} size="sm" />
                                <p className="mt-1 text-xs text-gray-500">
                                    {tutorProfile.total_sessions} sesiones completadas
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation with grouped sections */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {sidebarGroups.map((group) => {
                        const collapsed = collapsedGroups[group.title] && !isGroupActive(group);

                        return (
                            <div key={group.title} className="mb-2">
                                {/* Group header */}
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        isGroupActive(group)
                                            ? isTutor ? 'text-emerald-600' : 'text-blue-600'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
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
                                                            ? `${accentBg} ${accentText} shadow-sm`
                                                            : `text-gray-600 ${accentBgHover} ${accentTextHover}`
                                                    }`}
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    <span className={isActive(item) ? accentIcon : 'text-gray-400'}>
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                    {isActive(item) && (
                                                        <span className={`ml-auto h-1.5 w-1.5 rounded-full ${accentDot}`} />
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
                    <Link
                        href={route('home')}
                        className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        Volver al Inicio
                    </Link>
                    <form onSubmit={handleLogout}>
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
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

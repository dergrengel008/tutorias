import { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    GraduationCap,
    Search,
    DollarSign,
    Info,
    Home,
    User,
    Coins,
    Bell,
    LogOut,
    LogIn,
    UserPlus,
    Menu,
    X,
    LayoutDashboard,
    ChevronDown,
} from 'lucide-react';
import FlashMessage from './FlashMessage';
import Avatar from './Avatar';
import LanguageSwitcher from './LanguageSwitcher';
import type { User as UserType } from '@/types';
import { route } from '@/route';

interface DefaultLayoutProps {
    children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
    const page = usePage().props as any;
    const auth = page.auth as { user: UserType | null; role: string | null };
    const user = auth.user;
    const role = auth.role;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const dashboardRoute =
        role === 'admin'
            ? 'admin.dashboard'
            : role === 'tutor'
              ? 'tutor.dashboard'
              : role === 'student'
                ? 'student.dashboard'
                : 'dashboard';

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const navLinkClass =
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700';





    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <FlashMessage />

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            TutoriaApp
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden items-center gap-1 md:flex">
                        <Link href={route('home')} className={navLinkClass}>
                            <Home className="h-4 w-4" />
                            Inicio
                        </Link>
                        <Link href={route('search')} className={navLinkClass}>
                            <Search className="h-4 w-4" />
                            Buscar Tutores
                        </Link>
                        <Link href={route('pricing')} className={navLinkClass}>
                            <DollarSign className="h-4 w-4" />
                            Precios
                        </Link>
                        <Link href={route('about')} className={navLinkClass}>
                            <Info className="h-4 w-4" />
                            Acerca de
                        </Link>
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden items-center gap-3 md:flex">
                        <LanguageSwitcher />
                            {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route(dashboardRoute)}
                                    className={navLinkClass}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>

                                <Link
                                    href={route('notifications.index')}
                                    className="relative flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <Bell className="h-5 w-5" />
                                </Link>

                                {/* User dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100"
                                    >
                                        <Avatar src={user.avatar} name={user.name} size="sm" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                                                <div className="border-b border-gray-100 px-4 py-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                    <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                                                        {role}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={role ? route(role + '.profile') : '/login'}
                                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    Mi Perfil
                                                </Link>
                                                <Link
                                                    href={route('tokens.index')}
                                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Coins className="h-4 w-4 text-gray-400" />
                                                    Mis Tokens
                                                </Link>
                                                <Link
                                                    href={route('notifications.index')}
                                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Bell className="h-4 w-4 text-gray-400" />
                                                    Notificaciones
                                                </Link>
                                                <div className="my-1 border-t border-gray-100" />
                                                <form onSubmit={handleLogout}>
                                                    <button
                                                        type="submit"
                                                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Cerrar Sesión
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg hover:shadow-indigo-300"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
                        <div className="flex flex-col gap-1">
                            <Link
                                href={route('home')}
                                className={navLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Home className="h-4 w-4" />
                                Inicio
                            </Link>
                            <Link
                                href={route('search')}
                                className={navLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Search className="h-4 w-4" />
                                Buscar Tutores
                            </Link>
                            <Link
                                href={route('pricing')}
                                className={navLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <DollarSign className="h-4 w-4" />
                                Precios
                            </Link>
                            <Link
                                href={route('about')}
                                className={navLinkClass}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Info className="h-4 w-4" />
                                Acerca de
                            </Link>

                            <div className="my-2 border-t border-gray-100" />

                            {user ? (
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <Avatar src={user.avatar} name={user.name} size="md" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user.name}
                                            </p>
                                            <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                                                {role}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={route(dashboardRoute)}
                                        className={navLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href={role ? route(role + '.profile') : '/login'}
                                        className={navLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Mi Perfil
                                    </Link>
                                    <Link
                                        href={route('tokens.index')}
                                        className={navLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Coins className="h-4 w-4" />
                                        Mis Tokens
                                    </Link>
                                    <Link
                                        href={route('notifications.index')}
                                        className={navLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Bell className="h-4 w-4" />
                                        Notificaciones
                                    </Link>
                                    <form onSubmit={handleLogout}>
                                        <button
                                            type="submit"
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Cerrar Sesión
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={route('login')}
                                        className={navLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    TutoriaApp
                                </span>
                            </Link>
                            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                                Conectamos estudiantes con los mejores tutores para una
                                experiencia de aprendizaje personalizada y de calidad.
                            </p>
                        </div>

                        {/* Platform */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Plataforma
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href={route('home')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('search')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Buscar Tutores
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('pricing')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Precios
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Acerca de
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Para Estudiantes */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Para Estudiantes
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href={route('search')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Buscar Tutores
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('pricing')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Precios y Tokens
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Cómo Funciona
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Soporte
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Centro de Ayuda
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Términos de Servicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Política de Privacidad
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Contacto
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* For Tutors */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                Para Tutores
                            </h3>
                            <ul className="mt-4 space-y-3">
                                <li>
                                    <Link
                                        href={route('register')}
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Sé un Tutor
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Recursos para Tutores
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Comunidad
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-gray-200 pt-6">
                        <p className="text-center text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} TutoriaApp. Todos los derechos
                            reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

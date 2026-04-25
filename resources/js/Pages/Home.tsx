import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { route } from '@/route';
import {
    GraduationCap,
    Search,
    UserPlus,
    ArrowRight,
    Star,
    Users,
    Calendar,
    CreditCard,
    MonitorPlay,
    Sparkles,
    CheckCircle,
    Quote,
    BookOpen,
    Code,
    Palette,
    Music,
    Calculator,
    FlaskConical,
    Briefcase,
    Languages,
    ChevronRight,
    Zap,
    Shield,
} from 'lucide-react';
import DefaultLayout from '@/Components/DefaultLayout';
import Avatar from '@/Components/Avatar';
import StarRating from '@/Components/StarRating';
import type { TutorProfile, Specialty } from '@/types';

interface HomeProps {
    featuredTutors?: TutorProfile[];
    specialties?: Specialty[];
}

/* ─── Animated counter hook ─── */
function useAnimatedCounter(end: number, duration = 2000, startOnView = true) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(!startOnView);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!startOnView) return;
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [startOnView]);

    useEffect(() => {
        if (!started) return;
        let startTime: number | null = null;
        let rafId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            }
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [started, end, duration]);

    return { count, ref };
}

/* ─── Specialty icon mapper ─── */
const specialtyIconMap: Record<string, React.ReactNode> = {
    Matemáticas: <Calculator className="h-6 w-6" />,
    Ciencias: <FlaskConical className="h-6 w-6" />,
    Programación: <Code className="h-6 w-6" />,
    Idiomas: <Languages className="h-6 w-6" />,
    Diseño: <Palette className="h-6 w-6" />,
    Música: <Music className="h-6 w-6" />,
    Negocios: <Briefcase className="h-6 w-6" />,
    Tecnología: <MonitorPlay className="h-6 w-6" />,
};

const defaultSpecialtyIcon = <BookOpen className="h-6 w-6" />;

/* ─── Testimonials data ─── */
const testimonials = [
    {
        id: 1,
        name: 'María García',
        role: 'Estudiante de Ingeniería',
        comment:
            'Encontré un tutor increíble que me ayudó a aprobar Cálculo III. La plataforma es muy fácil de usar y las sesiones en vivo son de excelente calidad.',
        rating: 5,
        initials: 'MG',
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        role: 'Tutor de Programación',
        comment:
            'Como tutor, TutoriaApp me ha permitido compartir mi conocimiento con estudiantes de toda Latinoamérica. El sistema de tokens es justo y transparente.',
        rating: 5,
        initials: 'CR',
    },
    {
        id: 3,
        name: 'Ana Martínez',
        role: 'Estudiante de Idiomas',
        comment:
            'Aprendí inglés mucho más rápido con las sesiones personalizadas. Los tutores son profesionales certificados y la plataforma es muy confiable.',
        rating: 5,
        initials: 'AM',
    },
];

/* ─── Main Home component ─── */
export default function Home({ featuredTutors = [], specialties = [] }: HomeProps) {

    const statStudents = useAnimatedCounter(10000);
    const statTutors = useAnimatedCounter(500);
    const statSessions = useAnimatedCounter(50000);
    const statRating = useAnimatedCounter(48, 2000);

    return (
        <DefaultLayout>
            {/* ═══════ HERO SECTION ═══════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
                {/* Background pattern */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
                    <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl" />
                    <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        {/* Left column */}
                        <div className="text-center lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-sm">
                                <Sparkles className="h-4 w-4" />
                                La plataforma #1 de tutorías en línea
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Aprende con los{' '}
                                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                    Mejores Tutores
                                </span>
                            </h1>

                            <p className="mt-6 text-lg leading-relaxed text-indigo-100/80 sm:text-xl">
                                Conectamos estudiantes con tutores certificados en más de 20
                                materias. Aprende en vivo con sesiones personalizadas y avanza
                                a tu ritmo.
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                <Link
                                    href={route('tutors.index')}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-xl shadow-black/10 transition-all duration-200 hover:bg-gray-50 hover:shadow-2xl"
                                >
                                    <Search className="h-5 w-5" />
                                    Buscar Tutores
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/20"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Registrarse Gratis
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <Shield className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm">Pagos seguros</span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm">Tutores verificados</span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <Zap className="h-5 w-5 text-amber-400" />
                                    <span className="text-sm">Soporte 24/7</span>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Decorative cards */}
                        <div className="relative hidden lg:block">
                            <div className="relative">
                                {/* Floating card 1 */}
                                <div className="absolute -top-4 -left-4 z-10 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                                            <Users className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">10K+</p>
                                            <p className="text-xs text-indigo-200">Estudiantes activos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating card 2 */}
                                <div className="absolute -right-4 top-20 z-10 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                                            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">4.8</p>
                                            <p className="text-xs text-indigo-200">Calificación promedio</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating card 3 */}
                                <div className="absolute -bottom-4 left-8 z-10 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                                            <Calendar className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">50K+</p>
                                            <p className="text-xs text-indigo-200">Sesiones completadas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Central decorative element */}
                                <div className="mx-auto flex h-80 w-80 items-center justify-center rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
                                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 ring-4 ring-white/10">
                                        <GraduationCap className="h-20 w-20 text-white/80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full"
                    >
                        <path
                            d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
                            className="fill-gray-50"
                        />
                    </svg>
                </div>
            </section>

            {/* ═══════ STATS SECTION ═══════ */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        <div ref={statStudents.ref} className="text-center">
                            <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                                {statStudents.count.toLocaleString('es-ES')}+
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Estudiantes
                            </p>
                        </div>
                        <div ref={statTutors.ref} className="text-center">
                            <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                                {statTutors.count.toLocaleString('es-ES')}+
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Tutores Expertos
                            </p>
                        </div>
                        <div ref={statSessions.ref} className="text-center">
                            <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                                {statSessions.count.toLocaleString('es-ES')}+
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                                Sesiones Completadas
                            </p>
                        </div>
                        <div ref={statRating.ref} className="text-center">
                            <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">
                                {(statRating.count / 10).toFixed(1)}
                            </p>
                            <div className="mt-1 flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium text-gray-500">
                                    Calificación Promedio
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ HOW IT WORKS SECTION ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            ¿Cómo funciona?
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Comienza a aprender en 4 simples pasos
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                            Nuestra plataforma está diseñada para que comiences a aprender lo
                            antes posible sin complicaciones.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Step 1 */}
                        <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="absolute -top-4 -left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
                                1
                            </div>
                            <div className="mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                                <UserPlus className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Regístrate</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Crea tu cuenta gratuita en menos de un minuto. Solo necesitas tu
                                correo electrónico.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="absolute -top-4 -left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
                                2
                            </div>
                            <div className="mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                                <CreditCard className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Compra Tokens</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Adquiere paquetes de tokens para pagar tus sesiones. Múltiples
                                métodos de pago disponibles.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="absolute -top-4 -left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
                                3
                            </div>
                            <div className="mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                                <Calendar className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Reserva una Sesión
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Elige tu tutor, materia y horario. Recibe confirmación
                                inmediata de tu reserva.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="absolute -top-4 -left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
                                4
                            </div>
                            <div className="mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                                <MonitorPlay className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Aprende en Vivo</h3>
                            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                                Conecta con tu tutor en tiempo real. Pizarra compartida,
                                videochat y mucho más.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ FEATURED TUTORS SECTION ═══════ */}
            {featuredTutors.length > 0 && (
                <section className="bg-gray-50 py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                                Tutores Destacados
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Aprende de los mejores profesionales
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                                Nuestros tutores más valorados están listos para ayudarte a
                                alcanzar tus metas.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredTutors.slice(0, 6).map((tutor) => (
                                <Link
                                    key={tutor.id}
                                    href={route('tutors.show', tutor.id)}
                                    className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            src={tutor.user?.avatar}
                                            name={tutor.user?.name || 'Tutor'}
                                            size="xl"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-bold text-gray-900">
                                                {tutor.user?.name || 'Tutor'}
                                            </h3>
                                            {tutor.professional_title && (
                                                <p className="truncate text-sm text-gray-500">
                                                    {tutor.professional_title}
                                                </p>
                                            )}
                                            <StarRating
                                                rating={tutor.average_rating}
                                                size="sm"
                                            />
                                        </div>
                                    </div>

                                    {tutor.specialties && tutor.specialties.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {tutor.specialties.slice(0, 3).map((spec) => (
                                                <span
                                                    key={spec.id}
                                                    className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                                                >
                                                    {spec.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {tutor.total_sessions} sesiones
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                {tutor.years_experience} años
                                            </span>
                                        </div>
                                        {tutor.hourly_rate !== undefined && (
                                            <span className="text-lg font-bold text-indigo-600">
                                                ${tutor.hourly_rate}
                                                <span className="text-xs font-normal text-gray-400">
                                                    /hr
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-10 text-center">
                            <Link
                                href={route('tutors.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl"
                            >
                                Ver Todos los Tutores
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ SPECIALTIES SECTION ═══════ */}
            {specialties.length > 0 && (
                <section className="bg-white py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                                Especialidades
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Encuentra el tutor perfecto para ti
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                                Más de 20 materias disponibles con tutores especializados en cada
                                área.
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {specialties.map((specialty) => (
                                <Link
                                    key={specialty.id}
                                    href={route('tutors.index', { specialty: specialty.id })}
                                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 transition-all duration-200 group-hover:from-indigo-100 group-hover:to-purple-100">
                                        {specialtyIconMap[specialty.name] || defaultSpecialtyIcon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {specialty.name}
                                    </h3>
                                    {specialty.description && (
                                        <p className="line-clamp-2 text-xs text-gray-400">
                                            {specialty.description}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ TESTIMONIALS SECTION ═══════ */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full border border-indigo-300/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-indigo-100 backdrop-blur-sm">
                            Testimonios
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Lo que dicen nuestros usuarios
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100/70">
                            Miles de estudiantes y tutores confían en TutoriaApp para su formación.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm"
                            >
                                <Quote className="mb-4 h-8 w-8 text-indigo-300/60" />
                                <p className="text-sm leading-relaxed text-indigo-50/90">
                                    "{testimonial.comment}"
                                </p>
                                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                                    <Avatar
                                        name={testimonial.name}
                                        size="md"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-xs text-indigo-200">
                                            {testimonial.role}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-0.5">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-3 w-3 fill-amber-400 text-amber-400"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ CTA SECTION ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        ¿Listo para comenzar?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
                        Únete a miles de estudiantes que ya están aprendiendo con los mejores
                        tutores de habla hispana. ¡Tu primera sesión te espera!
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href={route('register')}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-2xl"
                        >
                            <UserPlus className="h-5 w-5" />
                            Crear Cuenta Gratis
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route('tutors.index')}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            <Search className="h-5 w-5" />
                            Explorar Tutores
                        </Link>
                    </div>
                </div>
            </section>
        </DefaultLayout>
    );
}

import {
    GraduationCap,
    Users,
    Globe,
    Shield,
    Heart,
    BookOpen,
    MonitorPlay,
    Award,
    Target,
    Lightbulb,
} from 'lucide-react';
import DefaultLayout from '@/Components/DefaultLayout';
import { route } from '@/route';

const values = [
    {
        icon: <Shield className="h-6 w-6" />,
        title: 'Confianza y Seguridad',
        description:
            'Todos nuestros tutores pasan por un riguroso proceso de verificación que incluye validación de identidad, revisión de títulos profesionales y evaluación de competencias pedagógicas. Garantizamos que cada tutor en nuestra plataforma cumple con los más altos estándares de calidad profesional.',
    },
    {
        icon: <Heart className="h-6 w-6" />,
        title: 'Pasión por la Educación',
        description:
            'Creemos que la educación transforma vidas. Cada día trabajamos con dedicación para conectar a estudiantes con los mejores tutores, facilitando un aprendizaje significativo que va más allá del aula tradicional y se adapta a las necesidades individuales de cada persona.',
    },
    {
        icon: <Lightbulb className="h-6 w-6" />,
        title: 'Innovación Continua',
        description:
            'Invertimos constantemente en tecnología de punta para ofrecer herramientas interactivas como pizarras compartidas en tiempo real, grabación de sesiones, material didáctico digital y un sistema de evaluación que permite medir el progreso de cada estudiante de forma objetiva.',
    },
    {
        icon: <Globe className="h-6 w-6" />,
        title: 'Accesibilidad para Todos',
        description:
            'Nuestra misión es democratizar el acceso a la educación de calidad. Con precios adaptados a diferentes presupuestos y una plataforma disponible en múltiples dispositivos, aseguramos que cualquier persona pueda acceder a tutorías profesionales sin barreras geográficas ni económicas.',
    },
];

const team = [
    {
        name: 'Alejandro Vega',
        role: 'CEO & Fundador',
        bio: 'Emprendedor serial con más de 15 años en el sector educativo. Apasionado por transformar la forma en que las personas aprenden.',
        initials: 'AV',
    },
    {
        name: 'Sofía Hernández',
        role: 'Directora Académica',
        bio: 'Doctora en Educación con experiencia en diseño curricular y tecnologías del aprendizaje. Lidera la estrategia pedagógica de la plataforma.',
        initials: 'SH',
    },
    {
        name: 'Diego Morales',
        role: 'CTO',
        bio: 'Ingeniero de software con maestría en Inteligencia Artificial. Responsable de la arquitectura tecnológica y las herramientas interactivas.',
        initials: 'DM',
    },
    {
        name: 'Valentina Cruz',
        role: 'Directora de Operaciones',
        bio: 'MBA con especialización en gestión de plataformas digitales. Se encarga de la experiencia de usuario y la eficiencia operativa.',
        initials: 'VC',
    },
];

const milestones = [
    {
        year: '2022',
        title: 'El Inicio',
        description: 'Fundación de TutoriaApp con la visión de democratizar la educación personalizada en Latinoamérica.',
    },
    {
        year: '2023',
        title: 'Crecimiento',
        description: 'Alcanzamos 5,000 estudiantes activos y 200 tutores verificados en 8 países de habla hispana.',
    },
    {
        year: '2024',
        title: 'Expansión',
        description: 'Lanzamiento de la pizarra interactiva en tiempo real y el sistema de tokens flexible.',
    },
    {
        year: '2025',
        title: 'Consolidación',
        description: 'Más de 50,000 sesiones completadas, 10,000 estudiantes y presencia en 15 países.',
    },
];

export default function About() {
    return (
        <DefaultLayout>
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl" />
                    <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-sm">
                            <BookOpen className="h-4 w-4" />
                            Nuestra Historia
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Acerca de{' '}
                            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                TutoriaApp
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100/80 sm:text-xl">
                            Nacimos con una misión clara: conectar a cada estudiante con el tutor
                            perfecto para que el aprendizaje sea personalizado, accesible y
                            transformador.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path
                            d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
                            className="fill-gray-50"
                        />
                    </svg>
                </div>
            </section>

            {/* ═══════ MISSION ═══════ */}
            <section className="bg-gray-50 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                                Nuestra Misión
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Democratizar la educación de calidad
                            </h2>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                En TutoriaApp creemos que cada persona merece acceso a una educación
                                de calidad, sin importar su ubicación geográfica o situación económica.
                                Nuestra plataforma elimina las barreras tradicionales de la tutoría
                                presencial, permitiendo a estudiantes de toda Latinoamérica conectarse
                                con profesionales certificados desde la comodidad de su hogar.
                            </p>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Utilizamos tecnología de vanguardia, incluyendo pizarras interactivas
                                en tiempo real, videoconferencia integrada y herramientas colaborativas
                                que replican e incluso mejoran la experiencia de aprendizaje
                                presencial. Cada sesión es una oportunidad de crecimiento
                                personal y profesional.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900">10K+</p>
                                <p className="mt-1 text-sm text-gray-500">Estudiantes activos</p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                                    <GraduationCap className="h-6 w-6 text-purple-600" />
                                </div>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900">500+</p>
                                <p className="mt-1 text-sm text-gray-500">Tutores verificados</p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                    <MonitorPlay className="h-6 w-6 text-amber-600" />
                                </div>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900">50K+</p>
                                <p className="mt-1 text-sm text-gray-500">Sesiones completadas</p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                    <Globe className="h-6 w-6 text-emerald-600" />
                                </div>
                                <p className="mt-4 text-3xl font-extrabold text-gray-900">15</p>
                                <p className="mt-1 text-sm text-gray-500">Países alcanzados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ VALUES ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Nuestros Valores
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Lo que nos define
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                            Cada decisión que tomamos está guiada por estos principios fundamentales
                            que nos caracterizan como empresa y comunidad.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 sm:grid-cols-2">
                        {values.map((item, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 transition-colors group-hover:from-indigo-100 group-hover:to-purple-100">
                                    {item.icon}
                                </div>
                                <h3 className="mt-5 text-xl font-bold text-gray-900">{item.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ TIMELINE ═══════ */}
            <section className="bg-gray-50 py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Nuestra Trayectoria
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Hitos importantes
                        </h2>
                    </div>
                    <div className="relative mt-16">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 sm:left-1/2 sm:-translate-x-px" />

                        <div className="space-y-12">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={index}
                                    className={`relative flex flex-col sm:flex-row sm:items-center ${
                                        index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                                    }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-4 -translate-x-1/2 sm:left-1/2 z-10">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                                            <Target className="h-4 w-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={`ml-12 sm:ml-0 sm:w-1/2 ${
                                        index % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'
                                    }`}>
                                        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                                            {milestone.year}
                                        </span>
                                        <h3 className="mt-2 text-lg font-bold text-gray-900">
                                            {milestone.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ TEAM ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Nuestro Equipo
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Las mentes detrás de TutoriaApp
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                            Un equipo multidisciplinario apasionado por la educación y la tecnología.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {team.map((member, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-indigo-200">
                                    {member.initials}
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm font-medium text-indigo-600">{member.role}</p>
                                <p className="mt-3 text-xs leading-relaxed text-gray-500">
                                    {member.bio}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                        <Award className="h-8 w-8 text-amber-300" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        ¿Quieres ser parte de nuestra historia?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100/70">
                        Ya seas estudiante buscando aprender o tutor deseando compartir tu
                        conocimiento, te invitamos a unirte a nuestra comunidad.
                    </p>
                    <a
                        href={route('register')}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-700 shadow-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-2xl"
                    >
                        Comenzar Ahora
                    </a>
                </div>
            </section>
        </DefaultLayout>
    );
}

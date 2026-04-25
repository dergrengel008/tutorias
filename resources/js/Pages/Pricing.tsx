import { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    GraduationCap,
    Coins,
    CheckCircle,
    Star,
    Zap,
    Crown,
    ArrowRight,
    Shield,
    HelpCircle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import DefaultLayout from '@/Components/DefaultLayout';
import { route } from '@/route';

interface PricingProps {
    packages: Array<{
        tokens: number;
        price: number;
        label: string;
    }>;
}

const planFeatures = [
    'Acceso a todos los tutores certificados',
    'Pizarra interactiva en tiempo real',
    'Sesiones de videoconferencia HD',
    'Grabación de sesiones',
    'Material didáctico incluido',
    'Calificación y reseñas',
    'Soporte técnico 24/7',
];

const planIcons: Record<string, React.ReactNode> = {
    Básico: <Coins className="h-6 w-6" />,
    Popular: <Star className="h-6 w-6" />,
    Avanzado: <Zap className="h-6 w-6" />,
    Premium: <Crown className="h-6 w-6" />,
    Empresa: <GraduationCap className="h-6 w-6" />,
};

const faqs = [
    {
        question: '¿Qué son los tokens y cómo funcionan?',
        answer:
            'Los tokens son la moneda virtual de TutoriaApp. Cada sesión de tutoría tiene un costo en tokens determinado por el tutor (generalmente entre 3 y 8 tokens por hora). Compras paquetes de tokens según tus necesidades y los usas para reservar sesiones con cualquier tutor de la plataforma.',
    },
    {
        question: '¿Los tokens tienen fecha de vencimiento?',
        answer:
            'Los tokens tienen una vigencia de 12 meses desde la fecha de compra. Te recomendamos adquirir el paquete que mejor se ajuste a tu frecuencia de estudio para aprovechar al máximo tu inversión.',
    },
    {
        question: '¿Puedo obtener un reembolso?',
        answer:
            'Sí, ofrecemos reembolso completo de tokens no utilizados dentro de los primeros 30 días posteriores a la compra. Los tokens que ya hayan sido utilizados en sesiones completadas no son reembolsables.',
    },
    {
        question: '¿Cómo elijo un buen tutor?',
        answer:
            'Puedes buscar tutores por especialidad, calificación promedio, precio y disponibilidad. Cada tutor tiene un perfil detallado que incluye su formación profesional, especialidades, reseñas de estudiantes anteriores y estadísticas de sesiones completadas.',
    },
    {
        question: '¿Qué pasa si no me gusta la sesión?',
        answer:
            'Si la sesión no cumple con tus expectativas por causas atribuibles al tutor, puedes solicitar la devolución de los tokens gastados dentro de las 24 horas siguientes a la sesión. Nuestro equipo revisará cada caso de forma justa.',
    },
];

export default function Pricing({ packages = [] }: PricingProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const defaultPackages = packages.length > 0 ? packages : [
        { tokens: 50, price: 5, label: 'Básico' },
        { tokens: 120, price: 10, label: 'Popular' },
        { tokens: 250, price: 18, label: 'Avanzado' },
        { tokens: 500, price: 30, label: 'Premium' },
        { tokens: 1000, price: 50, label: 'Empresa' },
    ];

    const getPricePerToken = (pkg: { tokens: number; price: number }) => {
        return (pkg.price / pkg.tokens).toFixed(3);
    };

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
                            <Coins className="h-4 w-4" />
                            Precios Transparentes
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Planes que se adaptan a{' '}
                            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                tu presupuesto
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100/80 sm:text-xl">
                            Compra tokens y úsalos cuando quieras con cualquier tutor de la plataforma.
                            Sin suscripciones, sin compromisos.
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

            {/* ═══════ PRICING CARDS ═══════ */}
            <section className="bg-gray-50 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Paquetes de Tokens
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Elige el plan ideal para ti
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                            Cuanto más compras, más ahorras. Todos los planes incluyen acceso completo
                            a todas las funcionalidades de la plataforma.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {defaultPackages.map((pkg, index) => {
                            const isPopular = pkg.label === 'Popular';
                            return (
                                <div
                                    key={index}
                                    className={`relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isPopular
                                            ? 'border-indigo-300 bg-white shadow-lg ring-2 ring-indigo-500'
                                            : 'border-gray-200 bg-white shadow-md'
                                    }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                                                <Star className="h-3 w-3" />
                                                Más Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                                            isPopular
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {planIcons[pkg.label] || <Coins className="h-6 w-6" />}
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                                            {pkg.label}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {pkg.tokens} tokens
                                        </p>
                                        <div className="mt-4">
                                            <span className="text-4xl font-extrabold text-gray-900">
                                                ${pkg.price}
                                            </span>
                                            <span className="text-sm text-gray-400"> USD</span>
                                        </div>
                                        <p className="mt-1 text-xs text-indigo-600 font-medium">
                                            ${getPricePerToken(pkg)} por token
                                        </p>
                                    </div>

                                    <Link
                                        href={route('tokens.index')}
                                        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                                            isPopular
                                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800'
                                                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                                        }`}
                                    >
                                        Comprar
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════ FEATURES INCLUDED ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Todo Incluido
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            ¿Qué incluye cada plan?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                            No importa el plan que elijas, tendrás acceso completo a todas las
                            funcionalidades de la plataforma.
                        </p>
                    </div>
                    <div className="mx-auto mt-12 max-w-3xl">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
                            <ul className="space-y-4">
                                {planFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SECURE PAYMENT ═══════ */}
            <section className="bg-gray-50 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                                Pagos Seguros
                            </span>
                            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Tu dinero está protegido
                            </h2>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Implementamos los más altos estándares de seguridad en todas las
                                transacciones. Tu información financiera está protegida con encriptación
                                de nivel bancario y cumplimiento de las normativas PCI DSS.
                            </p>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Además, nuestro sistema de tokens garantiza que solo pagues por las
                                sesiones que realmente disfrutas. Los tokens no utilizados se mantienen
                                en tu cuenta para que los uses cuando lo necesites.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <Shield className="h-8 w-8 text-indigo-600" />
                                <h3 className="mt-3 text-sm font-bold text-gray-900">
                                    Encriptación SSL
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Todas las transacciones están protegidas con certificado SSL de 256 bits.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <Coins className="h-8 w-8 text-purple-600" />
                                <h3 className="mt-3 text-sm font-bold text-gray-900">
                                    Sin Suscripciones
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Paga solo cuando necesites. Sin cargos automáticos ni compromisos mensuales.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                                <h3 className="mt-3 text-sm font-bold text-gray-900">
                                    Garantía de Devolución
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    30 días de garantía en tokens no utilizados. Sin preguntas.
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white p-6 shadow-md">
                                <GraduationCap className="h-8 w-8 text-amber-600" />
                                <h3 className="mt-3 text-sm font-bold text-gray-900">
                                    Tokens Sin Vencimiento
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Tus tokens son válidos por 12 meses. Úsalos a tu propio ritmo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ FAQ ═══════ */}
            <section className="bg-white py-20 sm:py-28">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
                            Preguntas Frecuentes
                        </span>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            ¿Tienes dudas?
                        </h2>
                    </div>
                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 shrink-0 text-indigo-600" />
                                        <span className="text-sm font-semibold text-gray-900">
                                            {faq.question}
                                        </span>
                                    </div>
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 shrink-0 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="border-t border-gray-100 px-6 py-4">
                                        <p className="text-sm leading-relaxed text-gray-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Comienza a aprender hoy mismo
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100/70">
                        Regístrate gratis y recibe 5 tokens de bienvenida para tu primera sesión
                        de tutoría completamente gratis.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href={route('register')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-700 shadow-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-2xl"
                        >
                            Registrarse Gratis
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href={route('search')}
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/20"
                        >
                            Explorar Tutores
                        </Link>
                    </div>
                </div>
            </section>
        </DefaultLayout>
    );
}

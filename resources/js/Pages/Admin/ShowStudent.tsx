import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Coins,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    Star,
} from 'lucide-react';

interface TokenRecord {
    id: number;
    quantity: number;
    transaction_type: string;
    description?: string;
    created_at: string;
}

interface SessionRecord {
    id: number;
    status: string;
    scheduled_at: string;
    ended_at?: string;
    token_cost: number;
    tutor_profile: {
        id: number;
        user: {
            id: number;
            name: string;
            avatar?: string;
        };
        professional_title?: string;
    };
}

interface StudentData {
    id: number;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    country?: string;
    bio?: string;
    avatar?: string;
    is_active: boolean;
    created_at: string;
    student_profile?: {
        education_level?: string;
        institution?: string;
        total_sessions_completed: number;
    } | null;
    tokens?: TokenRecord[];
    tutoring_sessions?: SessionRecord[];
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Programada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

const educationLabels: Record<string, string> = {
    secundaria: 'Secundaria',
    bachillerato: 'Bachillerato',
    tecnico: 'Técnico',
    licenciatura: 'Licenciatura',
    ingenieria: 'Ingeniería',
    maestria: 'Maestría',
    doctorado: 'Doctorado',
};

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function ShowStudent() {
    const { props } = usePage();
    const student = props.student as StudentData;
    const flash = props.flash as { success?: string; error?: string };
    const profile = student.student_profile;
    const sessions = student.tutoring_sessions || [];
    const tokens = student.tokens || [];

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-4 flex-1">
                        {student.avatar ? (
                            <img
                                src={student.avatar}
                                alt={student.name}
                                className="h-14 w-14 rounded-full object-cover border-2 border-indigo-100"
                            />
                        ) : (
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                {student.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                            <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <span
                            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                student.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {student.is_active ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5" />
                            )}
                            {student.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Personal Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                                Información Personal
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Correo</p>
                                        <p className="text-sm font-medium text-gray-900">{student.email}</p>
                                    </div>
                                </div>
                                {student.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Teléfono</p>
                                            <p className="text-sm font-medium text-gray-900">{student.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {(student.city || student.country) && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Ubicación</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {[student.city, student.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Registrado</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDate(student.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Info Card */}
                        {profile && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                                    Información Académica
                                </h2>
                                <div className="space-y-4">
                                    {profile.education_level && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500">
                                                <GraduationCap className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Nivel Educativo</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {educationLabels[profile.education_level] || profile.education_level}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-500">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Sesiones Completadas</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {profile.total_sessions_completed}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                                Acciones
                            </h2>
                            {student.is_active ? (
                                <button
                                    onClick={() => {
                                        if (confirm('¿Desactivar este estudiante? No podrá acceder al sistema.')) {
                                            router.post(`/admin/students/${student.id}/deactivate`);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Desactivar Cuenta
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (confirm('¿Activar este estudiante?')) {
                                            router.post(`/admin/students/${student.id}/activate`);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Activar Cuenta
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right column: Sessions + Tokens */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tokens Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                <Coins className="h-4 w-4" />
                                Historial de Tokens
                            </h2>
                            {tokens.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Tipo</th>
                                                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500">Cantidad</th>
                                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500">Descripción</th>
                                                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tokens.map((token) => (
                                                <tr key={token.id} className="border-b border-gray-50">
                                                    <td className="py-2.5 px-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                token.quantity > 0
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {token.quantity > 0 ? 'Recarga' : 'Gasto'}
                                                        </span>
                                                    </td>
                                                    <td className={`py-2.5 px-3 text-right font-semibold ${token.quantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {token.quantity > 0 ? '+' : ''}{token.quantity}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-600">{token.description || '—'}</td>
                                                    <td className="py-2.5 px-3 text-right text-gray-400">
                                                        {formatDate(token.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-6">Sin registros de tokens.</p>
                            )}
                        </div>

                        {/* Sessions History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Sesiones Recientes
                            </h2>
                            {sessions.length > 0 ? (
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <Star className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {session.tutor_profile?.user?.name || 'Tutor'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {session.tutor_profile?.professional_title || 'Tutor'}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[session.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {statusLabels[session.status] || session.status}
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDate(session.scheduled_at)}
                                                </p>
                                                <p className="text-xs font-medium text-indigo-600">
                                                    {session.token_cost} tokens
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-6">Sin sesiones registradas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

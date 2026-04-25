import { useState } from 'react';
import { usePage, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    CreditCard,
    TrendingUp,
    ArrowDownCircle,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Gift,
    X,
    Clock,
} from 'lucide-react';

interface Token {
    id: number;
    quantity: number;
    transaction_type: 'purchase' | 'session_payment' | 'refund' | 'admin_credit' | 'withdrawal';
    amount: number;
    tokens_before: number;
    tokens_after: number;
    description: string;
    created_at: string;
}

interface StudentProfile {
    education_level?: string;
    institution?: string;
    total_sessions_completed?: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    address?: string;
    avatar?: string;
    is_active: boolean;
    role: string;
    created_at: string;
    updated_at: string;
    student_profile?: StudentProfile;
    tokens?: Token[];
}

interface PageProps {
    student: Student;
    stats: {
        token_balance: number;
        total_spent: number;
        total_recharged: number;
        session_count: number;
    };
}

const tokenTypeLabels: Record<string, string> = {
    purchase: 'Recarga',
    session_payment: 'Pago Sesión',
    refund: 'Reembolso',
    admin_credit: 'Crédito Admin',
};

const tokenTypeStyles: Record<string, string> = {
    purchase: 'bg-green-100 text-green-800',
    session_payment: 'bg-red-100 text-red-800',
    refund: 'bg-yellow-100 text-yellow-800',
    admin_credit: 'bg-purple-100 text-purple-800',
};

export default function StudentShow() {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string } | undefined;
    const student = (props.student as Student) || ({} as Student);
    const stats = (props.stats as PageProps['stats']) || {
        token_balance: 0,
        total_spent: 0,
        total_recharged: 0,
        session_count: 0,
    };
    const tokens: Token[] = (student.tokens as Token[]) || [];

    const [showGiveTokensModal, setShowGiveTokensModal] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        user_id: number;
        quantity: number | string;
        description: string;
    }>({
        user_id: student.id,
        quantity: '',
        description: '',
    });

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '—';
        }
    };

    const formatDateShort = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    const handleToggleActive = () => {
        if (!student.id) return;
        const action = student.is_active ? 'desactivar' : 'activar';
        if (confirm(`¿Estás seguro de que deseas ${action} a este estudiante?`)) {
            const url = student.is_active
                ? `/admin/students/${student.id}/deactivate`
                : `/admin/students/${student.id}/activate`;
            router.post(url);
        }
    };

    const handleGiveTokens = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tokens/give', {
            onSuccess: () => {
                setShowGiveTokensModal(false);
                reset();
            },
            onError: () => {
                // errors will be shown in the modal
            },
        });
    };

    const openGiveTokensModal = () => {
        setData('user_id', student.id);
        setData('quantity', '');
        setData('description', '');
        clearErrors();
        setShowGiveTokensModal(true);
    };

    const statCards = [
        {
            label: 'Tokens Disponibles',
            value: stats.token_balance,
            icon: CreditCard,
            color: 'bg-purple-50 text-purple-700',
            iconBg: 'bg-purple-500',
        },
        {
            label: 'Total Recargado',
            value: stats.total_recharged,
            icon: TrendingUp,
            color: 'bg-green-50 text-green-700',
            iconBg: 'bg-green-500',
        },
        {
            label: 'Total Gastado',
            value: stats.total_spent,
            icon: ArrowDownCircle,
            color: 'bg-red-50 text-red-700',
            iconBg: 'bg-red-500',
        },
        {
            label: 'Sesiones Completadas',
            value: stats.session_count,
            icon: Calendar,
            color: 'bg-blue-50 text-blue-700',
            iconBg: 'bg-blue-500',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{flash.error}</p>
                    </div>
                )}

                {/* Back Button */}
                <a
                    href="/admin/students"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Estudiantes
                </a>

                {/* Student Header Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-indigo-50">
                            {student.avatar ? (
                                <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-indigo-600 font-bold text-2xl">
                                    {student.name?.charAt(0) || 'E'}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{student.name || 'Estudiante'}</h1>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        student.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {student.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                {student.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {student.email}
                                    </span>
                                )}
                                {student.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {student.phone}
                                    </span>
                                )}
                                {student.city && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {student.city}
                                    </span>
                                )}
                            </div>
                            {student.address && (
                                <p className="mt-1 text-sm text-gray-400 flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {student.address}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {student.student_profile?.education_level || 'Nivel no especificado'}
                                </span>
                                {student.student_profile?.institution && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {student.student_profile.institution}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Registrado: {formatDateShort(student.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleToggleActive}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                            student.is_active
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                    >
                        {student.is_active ? (
                            <>
                                <XCircle className="h-4 w-4" />
                                Desactivar Estudiante
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Activar Estudiante
                            </>
                        )}
                    </button>
                    <button
                        onClick={openGiveTokensModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                        <Gift className="h-4 w-4" />
                        Dar Tokens
                    </button>
                </div>

                {/* Token History Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-purple-500" />
                            Historial de Tokens
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Fecha
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Tipo
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Cantidad
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Saldo Antes
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Saldo Después
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Descripción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tokens.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            No hay transacciones de tokens registradas
                                        </td>
                                    </tr>
                                ) : (
                                    tokens.map((token) => (
                                        <tr
                                            key={token.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatDate(token.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        tokenTypeStyles[token.transaction_type] || 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {tokenTypeLabels[token.transaction_type] || token.transaction_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        token.transaction_type === 'session_payment' || token.transaction_type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                                                    }`}
                                                >
                                                    {token.transaction_type === 'session_payment' || token.transaction_type === 'withdrawal' ? '-' : '+'}{token.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-500 hidden sm:table-cell">
                                                {token.tokens_before}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-500 hidden sm:table-cell">
                                                {token.tokens_after}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell truncate max-w-xs">
                                                {token.description || '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Give Tokens Modal */}
            {showGiveTokensModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowGiveTokensModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Gift className="h-5 w-5 text-purple-500" />
                                Dar Tokens
                            </h3>
                            <button
                                onClick={() => setShowGiveTokensModal(false)}
                                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500">
                            Tokens para: <span className="font-semibold text-gray-700">{student.name}</span>
                        </p>

                        <form onSubmit={handleGiveTokens} className="space-y-4">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad de Tokens
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    placeholder="Ej: 10"
                                    autoFocus
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none"
                                    placeholder="Motivo del crédito de tokens..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGiveTokensModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Procesando...' : 'Dar Tokens'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

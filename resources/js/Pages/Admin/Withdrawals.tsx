import { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Wallet,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Clock,
    DollarSign,
    Coins,
    AlertTriangle,
    X,
} from 'lucide-react';

interface Withdrawal {
    id: number;
    tutor_profile_id: number;
    tutor?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    amount_tokens: number;
    dollar_amount: number;
    payment_method: string;
    payment_details?: string;
    status: string;
    rejection_reason?: string;
    created_at: string;
    updated_at?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse {
    data: Withdrawal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links?: PaginationLink[];
}

interface PageProps {
    withdrawals?: PaginatedResponse | Withdrawal[];
    stats?: {
        pending_tokens?: number;
        pending_usd?: number;
        approved_this_month_tokens?: number;
        approved_this_month_usd?: number;
    };
    status?: string;
}

export default function AdminWithdrawals({
    withdrawals: rawWithdrawals,
    stats = {},
    status: currentStatus = 'all',
}: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const withdrawals: Withdrawal[] = Array.isArray(rawWithdrawals)
        ? rawWithdrawals
        : (rawWithdrawals as PaginatedResponse)?.data || [];

    const pagination = !Array.isArray(rawWithdrawals) && rawWithdrawals
        ? (rawWithdrawals as PaginatedResponse)
        : null;

    const [rejectingWithdrawal, setRejectingWithdrawal] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const statusFilters = [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'approved', label: 'Aprobados' },
        { value: 'rejected', label: 'Rechazados' },
        { value: 'completed', label: 'Completados' },
    ];

    const s = stats || {};
    const pendingTokens = s.pending_tokens ?? 0;
    const pendingUsd = s.pending_usd ?? 0;
    const approvedTokens = s.approved_this_month_tokens ?? 0;
    const approvedUsd = s.approved_this_month_usd ?? 0;

    const handleApprove = (id: number) => {
        if (confirm('¿Estás seguro de que deseas aprobar este retiro?')) {
            router.post(`/admin/withdrawals/${id}/approve`);
        }
    };

    const openRejectModal = (id: number) => {
        setRejectingWithdrawal(id);
        setRejectReason('');
    };

    const closeRejectModal = () => {
        setRejectingWithdrawal(null);
        setRejectReason('');
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        if (rejectingWithdrawal !== null) {
            router.post(`/admin/withdrawals/${rejectingWithdrawal}/reject`, {
                rejection_reason: rejectReason,
            });
            closeRejectModal();
        }
    };

    const handleFilterChange = (status: string) => {
        router.get('/admin/withdrawals', { status }, { preserveState: false });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-emerald-100 text-emerald-800',
        };
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado',
            completed: 'Completado',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const paymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            bank_transfer: 'Transferencia Bancaria',
            paypal: 'PayPal',
        };
        return labels[method] || method;
    };

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

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                            <Wallet className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Retiros de Tutores
                            </h1>
                            <p className="text-gray-500 mt-0.5">
                                Gestiona las solicitudes de retiro de los tutores
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 mb-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Pendientes (tokens)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{pendingTokens.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 mb-3">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Pendientes (USD)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${Number(pendingUsd).toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 mb-3">
                            <Coins className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Aprobados (mes, tokens)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{approvedTokens.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 mb-3">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Aprobados (mes, USD)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${Number(approvedUsd).toFixed(2)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => handleFilterChange(filter.value)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        currentStatus === filter.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        {pagination && (
                            <span className="ml-auto text-xs text-gray-400">
                                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Tutor</th>
                                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Tokens</th>
                                    <th className="text-right py-3 px-4 text-gray-500 font-medium">USD</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Método</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Estado</th>
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Fecha</th>
                                    <th className="text-right py-3 px-4 text-gray-500 font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12">
                                            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No hay retiros</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {currentStatus !== 'all'
                                                    ? `No hay retiros con estado "${currentStatus}"`
                                                    : 'No hay solicitudes de retiro registradas'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawals.map((w) => (
                                        <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">#{w.id}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {w.tutor?.user?.avatar ? (
                                                        <img
                                                            src={w.tutor.user.avatar}
                                                            alt=""
                                                            className="h-8 w-8 rounded-full object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                            <span className="text-xs font-bold text-indigo-600">
                                                                {w.tutor?.user?.name?.charAt(0) || 'T'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 truncate max-w-[150px]">
                                                        {w.tutor?.user?.name || `Tutor #${w.tutor_profile_id}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                                {Number(w.amount_tokens).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                                                ${Number(w.dollar_amount).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {paymentMethodLabel(w.payment_method)}
                                            </td>
                                            <td className="py-3 px-4">{statusBadge(w.status)}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                                                {formatDate(w.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {w.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(w.id)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                                                            >
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(w.id)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                                Rechazar
                                                            </button>
                                                        </>
                                                    )}
                                                    {w.status === 'rejected' && w.rejection_reason && (
                                                        <span
                                                            className="text-xs text-red-500 max-w-[120px] truncate"
                                                            title={w.rejection_reason}
                                                        >
                                                            {w.rejection_reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Mostrando {pagination.from}–{pagination.to} de {pagination.total}
                            </p>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={pagination.prev_page_url || '#'}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        pagination.prev_page_url
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Link>
                                {pagination.links
                                    ?.filter(
                                        (l) =>
                                            l.label !== '&laquo; Previous' &&
                                            l.label !== 'Next &raquo;'
                                    )
                                    .map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                <Link
                                    href={pagination.next_page_url || '#'}
                                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        pagination.next_page_url
                                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                    }`}
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {rejectingWithdrawal !== null && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Rechazar Retiro
                            </h2>
                            <button
                                onClick={closeRejectModal}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mb-4 bg-red-50 rounded-lg p-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                            <p className="text-sm text-red-700">
                                Se notificará al tutor con el motivo del rechazo. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Motivo del rechazo *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                                placeholder="Describe el motivo del rechazo..."
                            />
                            {!rejectReason.trim() && (
                                <p className="text-xs text-red-500 mt-1">
                                    Debes ingresar un motivo de rechazo
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeRejectModal}
                                className="rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

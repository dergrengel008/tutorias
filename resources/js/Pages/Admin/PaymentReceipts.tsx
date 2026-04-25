import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Eye,
    EyeOff,
    Image,
    Banknote,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    MessageSquare,
    X,
} from 'lucide-react';
import { route } from '@/route';

interface PaymentReceipt {
    id: number;
    user_id: number;
    tokens_requested: number;
    amount_paid: string;
    currency: string;
    bank_name: string;
    phone_number: string;
    reference_number: string;
    receipt_image_path: string;
    status: string;
    admin_notes: string | null;
    reviewed_at: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    reviewer?: {
        id: number;
        name: string;
    };
}

interface PageProps {
    receipts: any;
    filters: any;
    pendingCount: number;
}

export default function AdminPaymentReceipts({ receipts, filters, pendingCount }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const receiptsData = receipts?.data || receipts || [];

    const [statusFilter, setStatusFilter] = useState(filters?.status || 'pending');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNotes, setRejectNotes] = useState('');
    const [rejectErrors, setRejectErrors] = useState<Record<string, string>>({});

    const handleFilter = () => {
        router.get(route('admin.payment-receipts.index'), {
            status: statusFilter,
            search: searchQuery,
        }, { preserveState: true });
    };

    const handleApprove = (receiptId: number) => {
        if (confirm('¿Estás seguro de aprobar esta recarga? Se acreditarán los tokens al estudiante.')) {
            router.post(`/admin/payment-receipts/${receiptId}/approve`, {
                admin_notes: '',
            }, {
                onSuccess: () => {
                    setSelectedReceipt(null);
                },
            });
        }
    };

    const handleReject = (receiptId: number) => {
        if (!rejectNotes.trim()) {
            setRejectErrors({ admin_notes: 'Debes indicar el motivo del rechazo.' });
            return;
        }
        setRejectErrors({});

        router.post(`/admin/payment-receipts/${receiptId}/reject`, {
            admin_notes: rejectNotes,
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectNotes('');
                setSelectedReceipt(null);
            },
        });
    };

    const openRejectModal = (receipt: PaymentReceipt) => {
        setSelectedReceipt(receipt);
        setShowRejectModal(true);
        setRejectNotes('');
        setRejectErrors({});
    };

    const statusBadge = (status: string) => {
        const config: Record<string, { label: string; color: string }> = {
            pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
            approved: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-800' },
            rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
        };
        const c = config[status] || config.pending;
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.color}`}>{c.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getImageUrl = (path: string) => {
        return `/storage/${path}`;
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Banknote className="h-7 w-7 text-indigo-500" />
                            Recargas por Pago Móvil
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona las solicitudes de recarga de tokens de los estudiantes.
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-800">
                                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recibos</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="h-4 w-4 text-gray-400" />
                            {[
                                { value: 'pending', label: 'Pendientes' },
                                { value: 'approved', label: 'Aprobados' },
                                { value: 'rejected', label: 'Rechazados' },
                                { value: '', label: 'Todos' },
                            ].map((f) => (
                                <button
                                    key={f.value || 'all'}
                                    onClick={() => setStatusFilter(f.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        statusFilter === f.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    placeholder="Buscar por nombre o email..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Receipts List */}
                {receiptsData.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin solicitudes</h3>
                        <p className="text-gray-500">No hay solicitudes de recarga con los filtros seleccionados.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {receiptsData.map((receipt: PaymentReceipt) => (
                            <div
                                key={receipt.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {receipt.user?.name || 'Usuario'}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {receipt.user?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">Tokens</p>
                                                <p className="text-lg font-bold text-indigo-600">{receipt.tokens_requested}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">Monto</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {Number(receipt.amount_paid).toFixed(2)} {receipt.currency}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">Referencia</p>
                                                <p className="text-sm font-mono font-medium text-gray-700">
                                                    {receipt.reference_number}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">Banco</p>
                                                <p className="text-sm font-medium text-gray-700">{receipt.bank_name}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 font-medium">Fecha</p>
                                                <p className="text-sm text-gray-600">{formatDate(receipt.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {statusBadge(receipt.status)}
                                            <button
                                                onClick={() => setSelectedReceipt(receipt)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Ver comprobante"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            {receipt.status === 'pending' && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleApprove(receipt.id)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(receipt)}
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Admin Notes (if reviewed) */}
                                    {receipt.admin_notes && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                Notas del admin:
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{receipt.admin_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {receipts?.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {receipts.prev_page_url && (
                            <button
                                onClick={() => router.get(receipts.prev_page_url, {}, { preserveState: true })}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>
                        )}
                        <span className="text-sm text-gray-500">
                            Página {receipts.current_page} de {receipts.last_page}
                        </span>
                        {receipts.next_page_url && (
                            <button
                                onClick={() => router.get(receipts.next_page_url, {}, { preserveState: true })}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Receipt Image Modal */}
            {selectedReceipt && !showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedReceipt(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-bold text-gray-900">
                                Comprobante de Pago - {selectedReceipt.user?.name}
                            </h3>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Receipt Image */}
                            <div className="rounded-xl overflow-hidden border border-gray-200 mb-6">
                                <img
                                    src={getImageUrl(selectedReceipt.receipt_image_path)}
                                    alt="Comprobante de pago"
                                    className="w-full h-auto object-contain bg-gray-50"
                                />
                            </div>

                            {/* Receipt Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Tokens Solicitados</p>
                                    <p className="text-lg font-bold text-indigo-600">{selectedReceipt.tokens_requested}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Monto Pagado</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {Number(selectedReceipt.amount_paid).toFixed(2)} {selectedReceipt.currency}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Referencia</p>
                                    <p className="text-lg font-mono font-bold text-gray-700">{selectedReceipt.reference_number}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Banco</p>
                                    <p className="font-semibold text-gray-700">{selectedReceipt.bank_name}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Teléfono</p>
                                    <p className="font-semibold text-gray-700">{selectedReceipt.phone_number}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400">Estado</p>
                                    {statusBadge(selectedReceipt.status)}
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedReceipt.status === 'pending' && (
                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openRejectModal(selectedReceipt)}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <XCircle className="h-5 w-5" />
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedReceipt.id)}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Aprobar y Acreditar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => { setShowRejectModal(false); setRejectNotes(''); }}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Rechazar Recarga
                            </h3>
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectNotes(''); }}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Estás rechazando la recarga de <strong>{selectedReceipt.tokens_requested} tokens</strong> de{' '}
                                <strong>{selectedReceipt.user?.name}</strong>.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Motivo del rechazo *
                                </label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none text-sm"
                                    placeholder="Explica por qué se rechaza esta recarga..."
                                />
                                {rejectErrors.admin_notes && (
                                    <p className="text-red-500 text-xs mt-1">{rejectErrors.admin_notes}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => { setShowRejectModal(false); setRejectNotes(''); }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleReject(selectedReceipt.id)}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Confirmar Rechazo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

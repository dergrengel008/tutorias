import { useState, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    DollarSign,
    CreditCard,
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCcw,
    Gift,
    CheckCircle,
    XCircle,
    Upload,
    Smartphone,
    Banknote,
    Clock,
    AlertCircle,
    Info,
    Image as ImageIcon,
    Eye,
    X,
    FileText,
} from 'lucide-react';
import { route } from '@/route';

interface PageProps {
    currentBalance: number;
    transactions: any;
    pendingReceipts: any[];
    recentReceipts: any[];
    packages: Array<{
        tokens: number;
        price: number;
        bonus?: number;
    }>;
}

export default function TokensIndex({ currentBalance: balance, transactions: transactionsData, pendingReceipts, recentReceipts }: PageProps) {
    const transactions = transactionsData?.data || transactionsData || [];
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const errors = props.errors as Record<string, string>;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        tokens_requested: '',
        amount_paid: '',
        currency: 'USD',
        bank_name: '',
        phone_number: '',
        reference_number: '',
    });
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState<any>(null);

    const defaultPackages = [
        { tokens: 10, price: 5, bonus: 0 },
        { tokens: 25, price: 10, bonus: 2 },
        { tokens: 50, price: 18, bonus: 5 },
        { tokens: 100, price: 30, bonus: 15 },
    ];

    const packages = (props as any).packages || defaultPackages;

    const handlePackageSelect = (tokens: number, price: number) => {
        setSelectedPackage(tokens);
        setFormData({
            ...formData,
            tokens_requested: String(tokens + (packages.find(p => p.tokens === tokens)?.bonus || 0)),
            amount_paid: String(price),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptImage) return;

        setIsSubmitting(true);

        const submitData = new FormData();
        submitData.append('tokens_requested', formData.tokens_requested);
        submitData.append('amount_paid', formData.amount_paid);
        submitData.append('currency', formData.currency);
        submitData.append('bank_name', formData.bank_name);
        submitData.append('phone_number', formData.phone_number);
        submitData.append('reference_number', formData.reference_number);
        submitData.append('receipt_image', receiptImage);

        router.post(route('student.tokens.topup'), submitData, {
            forceFormData: true,
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'purchase':
                return <ArrowUpCircle className="h-5 w-5 text-emerald-500" />;
            case 'session_payment':
                return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
            case 'refund':
                return <RotateCcw className="h-5 w-5 text-blue-500" />;
            case 'admin_credit':
                return <Gift className="h-5 w-5 text-purple-500" />;
            default:
                return <DollarSign className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'purchase':
                return 'text-emerald-600 bg-emerald-50';
            case 'session_payment':
                return 'text-red-600 bg-red-50';
            case 'refund':
                return 'text-blue-600 bg-blue-50';
            case 'admin_credit':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getTransactionLabel = (type: string) => {
        const labels: Record<string, string> = {
            purchase: 'Compra',
            session_payment: 'Pago de Sesión',
            refund: 'Reembolso',
            admin_credit: 'Crédito Admin',
        };
        return labels[type] || type;
    };

    const getReceiptStatusBadge = (status: string) => {
        const config: Record<string, { label: string; color: string; icon: any }> = {
            pending: { label: 'En Revisión', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
            approved: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
            rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        };
        const c = config[status] || config.pending;
        const Icon = c.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.color}`}>
                <Icon className="h-3 w-3" />
                {c.label}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-VE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
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

                {/* Pending Receipts Alert */}
                {pendingReceipts && pendingReceipts.length > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-amber-800 text-sm">
                                    Tienes {pendingReceipts.length} recarga{pendingReceipts.length > 1 ? 's' : ''} pendiente{pendingReceipts.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-amber-700 text-xs mt-1">
                                    Tu comprobante está siendo verificado. Recibirás una notificación cuando sea aprobado.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
                    <div className="relative text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CreditCard className="h-6 w-6 text-indigo-200" />
                            <p className="text-indigo-200 font-medium text-lg">Tu Saldo de Tokens</p>
                        </div>
                        <p className="text-6xl md:text-7xl font-bold mb-2">{balance}</p>
                        <p className="text-indigo-200 text-sm">tokens disponibles</p>
                        <div className="flex justify-center gap-6 mt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{transactions.filter((t: any) => t.transaction_type === 'purchase').length}</p>
                                <p className="text-indigo-200 text-xs">Compras</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div className="text-center">
                                <p className="text-2xl font-bold">{transactions.filter((t: any) => t.transaction_type === 'session_payment').length}</p>
                                <p className="text-indigo-200 text-xs">Sesiones</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div className="text-center">
                                <p className="text-2xl font-bold">{transactions.filter((t: any) => t.transaction_type === 'refund').length}</p>
                                <p className="text-indigo-200 text-xs">Reembolsos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Top Up - Pago Móvil Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Smartphone className="h-6 w-6 text-emerald-600" />
                        ¿Cómo recargar tus tokens?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                <span className="font-bold">1</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">Elige tu paquete</h3>
                            <p className="text-xs text-gray-500">Selecciona la cantidad de tokens que deseas comprar.</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                <span className="font-bold">2</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">Realiza el Pago Móvil</h3>
                            <p className="text-xs text-gray-500">Transfiere el monto al número de teléfono y banco indicados.</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                                <span className="font-bold">3</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">Sube tu comprobante</h3>
                            <p className="text-xs text-gray-500">Toma una captura de pantalla del comprobante y súbelo aquí.</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                                <span className="font-bold">4</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">¡Listo!</h3>
                            <p className="text-xs text-gray-500">Un administrador revisará y acreditará tus tokens.</p>
                        </div>
                    </div>
                    <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-100">
                        <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Datos para el Pago Móvil</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Banco: <strong>Banco de Venezuela (BDV)</strong> | Teléfono: <strong>0414-123-4567</strong> | C.I./RIF: <strong>V-12345678</strong>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Los datos de pago los proporciona el administrador de la plataforma.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Packages + Top Up Form */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <Banknote className="h-6 w-6 text-indigo-500" />
                        Comprar Tokens
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Package Selection */}
                        <div className="lg:col-span-1">
                            <div className="space-y-3">
                                {packages.map((pkg, index) => {
                                    const totalTokens = pkg.tokens + (pkg.bonus || 0);
                                    const isSelected = selectedPackage === pkg.tokens;
                                    return (
                                        <button
                                            key={pkg.tokens}
                                            onClick={() => handlePackageSelect(pkg.tokens, pkg.price)}
                                            className={`w-full relative rounded-xl p-4 text-left transition-all duration-200 border-2 ${
                                                isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                            }`}
                                        >
                                            {index === 3 && (
                                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    Mejor Valor
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {totalTokens}
                                                        <span className="text-sm font-normal text-gray-500 ml-1">tokens</span>
                                                    </p>
                                                    {(pkg.bonus ?? 0) > 0 && (
                                                        <span className="text-xs text-emerald-600 font-semibold">
                                                            +{pkg.bonus} bonus incluido
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-gray-900">${pkg.price}</p>
                                                    <p className="text-xs text-gray-400">USD</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Up Form */}
                        <div className="lg:col-span-2">
                            {selectedPackage ? (
                                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-indigo-500" />
                                        Completar Recarga
                                    </h3>

                                    {/* Error Message */}
                                    {errors?.receipt_image && (
                                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-red-700 text-sm">{errors.receipt_image}</p>
                                        </div>
                                    )}

                                    {/* Tokens & Amount */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Tokens a Recargar
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tokens_requested}
                                                readOnly
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Monto a Pagar
                                            </label>
                                            <input
                                                type="text"
                                                value={`$${formData.amount_paid} USD`}
                                                readOnly
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Moneda del Pago Móvil
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        >
                                            <option value="USD">Dólares (USD)</option>
                                            <option value="VES">Bolívares (VES)</option>
                                        </select>
                                    </div>

                                    {/* Bank & Phone */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Banco Emisor *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bank_name}
                                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                placeholder="Ej: Banco de Venezuela"
                                                required
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Teléfono Pago Móvil *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                placeholder="Ej: 0414-123-4567"
                                                required
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Reference Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Número de Referencia *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reference_number}
                                            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                            placeholder="Ej: 1234567890"
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        />
                                    </div>

                                    {/* Receipt Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Captura del Comprobante de Pago *
                                        </label>
                                        {!receiptPreview ? (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                                            >
                                                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-gray-600">
                                                    Haz clic para subir la captura del comprobante
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    PNG, JPG hasta 5MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                                <img
                                                    src={receiptPreview}
                                                    alt="Vista previa del comprobante"
                                                    className="w-full h-48 object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setReceiptImage(null); setReceiptPreview(null); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !receiptImage || !formData.bank_name || !formData.phone_number || !formData.reference_number}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5" />
                                                Enviar Solicitud de Recarga
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-400 text-center">
                                        Tu comprobante será revisado por un administrador. Recibirás una notificación cuando tus tokens sean acreditados.
                                    </p>
                                </form>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un paquete</h3>
                                    <p className="text-gray-500">Elige la cantidad de tokens que deseas comprar para comenzar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Receipts Status */}
                {recentReceipts && recentReceipts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Historial de Recargas
                        </h2>
                        <div className="space-y-3">
                            {recentReceipts.map((receipt: any) => (
                                <div
                                    key={receipt.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {receipt.tokens_requested} tokens por {Number(receipt.amount_paid).toFixed(2)} {receipt.currency}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Ref: {receipt.reference_number} - {formatDate(receipt.created_at)}
                                            </p>
                                            {receipt.admin_notes && receipt.status === 'rejected' && (
                                                <p className="text-xs text-red-500 mt-0.5">
                                                    Motivo: {receipt.admin_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getReceiptStatusBadge(receipt.status)}
                                        {receipt.receipt_image_path && (
                                            <button
                                                onClick={() => setShowReceiptModal(receipt)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Ver comprobante"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                        <History className="h-5 w-5 text-indigo-500" />
                        Historial de Transacciones
                    </h2>
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay transacciones registradas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                            Fecha
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                            Tipo
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                            Descripción
                                        </th>
                                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                            Cantidad
                                        </th>
                                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                            Saldo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((transaction: any) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(
                                                        transaction.transaction_type
                                                    )}`}
                                                >
                                                    {getTransactionIcon(transaction.transaction_type)}
                                                    {getTransactionLabel(transaction.transaction_type)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                                {transaction.description || '—'}
                                            </td>
                                            <td
                                                className={`py-3 px-4 text-sm font-semibold text-right ${
                                                    transaction.quantity > 0
                                                        ? 'text-emerald-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {transaction.quantity > 0 ? '+' : ''}
                                                {transaction.quantity}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                                                {transaction.tokens_after}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Receipt Image Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowReceiptModal(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Comprobante de Pago</h3>
                            <button
                                onClick={() => setShowReceiptModal(null)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={`/storage/${showReceiptModal.receipt_image_path}`}
                                alt="Comprobante de pago"
                                className="w-full h-auto object-contain rounded-xl bg-gray-50"
                            />
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <p className="text-gray-500">Referencia: <strong>{showReceiptModal.reference_number}</strong></p>
                                <p className="text-gray-500">Monto: <strong>{Number(showReceiptModal.amount_paid).toFixed(2)} {showReceiptModal.currency}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

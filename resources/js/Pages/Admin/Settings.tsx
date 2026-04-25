import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Settings,
    DollarSign,
    Globe,
    Save,
    CheckCircle,
    XCircle,
    CreditCard,
    Coins,
    Mail,
    FileText,
    ToggleLeft,
    ToggleRight,
    Loader2,
} from 'lucide-react';

interface PageProps {
    settings?: Record<string, string>;
    flash?: { success?: string; error?: string };
}

export default function AdminSettings() {
    const { props } = usePage();
    const settingsMap = (props.settings as Record<string, string>) || {};
    const flash = (props.flash as { success?: string; error?: string }) || {};

    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [localFlash, setLocalFlash] = useState<{ success?: string; error?: string }>({});

    const [formData, setFormData] = useState({
        platform_name: settingsMap.platform_name || 'TutoriaApp',
        support_email: settingsMap.support_email || 'soporte@tutoriaapp.com',
        platform_description: settingsMap.platform_description || '',
        maintenance_mode: settingsMap.maintenance_mode === '1' || settingsMap.maintenance_mode === 'true',
        commission_rate: settingsMap.commission_rate || '15',
        minimum_withdrawal_tokens: settingsMap.minimum_withdrawal_tokens || '500',
        token_price_usd: settingsMap.token_price_usd || '1.00',
        default_tokens_per_session: settingsMap.default_tokens_per_session || '100',
        branding_name: settingsMap.branding_name || settingsMap.platform_name || 'TutoriaApp',
        branding_description: settingsMap.branding_description || settingsMap.platform_description || '',
    });

    const displayFlash = flash.success || flash.error ? flash : localFlash;

    const updateField = (key: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setLocalFlash({});
    };

    const handleToggleMaintenance = () => {
        const newValue = !formData.maintenance_mode;
        setFormData((prev) => ({ ...prev, maintenance_mode: newValue }));
        setLocalFlash({});

        router.put('/admin/settings', {
            ...formData,
            maintenance_mode: newValue,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setLocalFlash({ success: newValue ? 'Modo de mantenimiento activado.' : 'Modo de mantenimiento desactivado.' });
            },
            onError: () => {
                setLocalFlash({ error: 'Error al cambiar el modo de mantenimiento.' });
                setFormData((prev) => ({ ...prev, maintenance_mode: !newValue }));
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setLocalFlash({});

        router.put('/admin/settings', formData, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => {
                setLocalFlash({ success: 'Configuración actualizada exitosamente.' });
            },
            onError: () => {
                setLocalFlash({ error: 'Error al guardar la configuración.' });
            },
        });
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'payments', label: 'Pagos', icon: DollarSign },
        { id: 'branding', label: 'Branding', icon: FileText },
    ];

    const inputClass =
        'block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20';
    const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
    const errorClass = 'mt-1.5 text-sm text-red-600';

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Flash Messages */}
                {displayFlash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">{displayFlash.success}</p>
                    </div>
                )}
                {displayFlash?.error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{displayFlash.error}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                            <Settings className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Configuración de la Plataforma
                            </h1>
                            <p className="text-gray-500 mt-0.5">
                                Administra las configuraciones generales del sistema
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-1 -mb-px" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`tabpanel-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div id="tabpanel-general" role="tabpanel" className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="h-5 w-5 text-indigo-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Configuración General
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="platform_name" className={labelClass}>
                                            Nombre de la Plataforma
                                        </label>
                                        <input
                                            id="platform_name"
                                            type="text"
                                            value={formData.platform_name}
                                            onChange={(e) => updateField('platform_name', e.target.value)}
                                            className={inputClass}
                                            placeholder="TutoriaApp"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="support_email" className={labelClass}>
                                            Correo de Soporte
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Mail className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="support_email"
                                                type="email"
                                                value={formData.support_email}
                                                onChange={(e) => updateField('support_email', e.target.value)}
                                                className={`${inputClass} pl-11`}
                                                placeholder="soporte@tutoriaapp.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="platform_description" className={labelClass}>
                                        Descripción de la Plataforma
                                    </label>
                                    <textarea
                                        id="platform_description"
                                        value={formData.platform_description}
                                        onChange={(e) => updateField('platform_description', e.target.value)}
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Conectamos estudiantes con los mejores tutores..."
                                    />
                                </div>

                                {/* Maintenance Mode Toggle */}
                                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${formData.maintenance_mode ? 'bg-amber-50' : 'bg-gray-200'}`}>
                                            {formData.maintenance_mode ? (
                                                <ToggleRight className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Modo de Mantenimiento
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formData.maintenance_mode
                                                    ? 'La plataforma está en mantenimiento. Solo los administradores pueden acceder.'
                                                    : 'La plataforma está operativa y accesible para todos los usuarios.'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.maintenance_mode}
                                        aria-label="Activar o desactivar modo de mantenimiento"
                                        onClick={handleToggleMaintenance}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                                            formData.maintenance_mode
                                                ? 'bg-amber-500'
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                                formData.maintenance_mode
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <div id="tabpanel-payments" role="tabpanel" className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-indigo-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Configuración de Pagos
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="commission_rate" className={labelClass}>
                                            Tasa de Comisión (%)
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <CreditCard className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="commission_rate"
                                                type="number"
                                                value={formData.commission_rate}
                                                onChange={(e) => updateField('commission_rate', e.target.value)}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                className={`${inputClass} pl-11 pr-10`}
                                                placeholder="15"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                                                <span className="text-sm text-gray-400">%</span>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Porcentaje que la plataforma retiene de cada pago de sesión
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="minimum_withdrawal_tokens" className={labelClass}>
                                            Mínimo de Retiro (tokens)
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Coins className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="minimum_withdrawal_tokens"
                                                type="number"
                                                value={formData.minimum_withdrawal_tokens}
                                                onChange={(e) => updateField('minimum_withdrawal_tokens', e.target.value)}
                                                min="1"
                                                className={`${inputClass} pl-11`}
                                                placeholder="500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="token_price_usd" className={labelClass}>
                                            Precio del Token (USD)
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <DollarSign className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="token_price_usd"
                                                type="number"
                                                value={formData.token_price_usd}
                                                onChange={(e) => updateField('token_price_usd', e.target.value)}
                                                min="0.01"
                                                step="0.01"
                                                className={`${inputClass} pl-11 pr-10`}
                                                placeholder="1.00"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                                                <span className="text-sm text-gray-400">USD</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="default_tokens_per_session" className={labelClass}>
                                            Tokens por Sesión (predeterminado)
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Coins className="h-4.5 w-4.5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                id="default_tokens_per_session"
                                                type="number"
                                                value={formData.default_tokens_per_session}
                                                onChange={(e) => updateField('default_tokens_per_session', e.target.value)}
                                                min="1"
                                                className={`${inputClass} pl-11`}
                                                placeholder="100"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Cantidad predeterminada de tokens por sesión de tutoría
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Branding Tab */}
                        {activeTab === 'branding' && (
                            <div id="tabpanel-branding" role="tabpanel" className="p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Marca e Identidad
                                    </h2>
                                </div>

                                <div>
                                    <label htmlFor="branding_name" className={labelClass}>
                                        Nombre de Marca
                                    </label>
                                    <input
                                        id="branding_name"
                                        type="text"
                                        value={formData.branding_name}
                                        onChange={(e) => updateField('branding_name', e.target.value)}
                                        className={inputClass}
                                        placeholder="TutoriaApp"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="branding_description" className={labelClass}>
                                        Descripción de Marca
                                    </label>
                                    <textarea
                                        id="branding_description"
                                        value={formData.branding_description}
                                        onChange={(e) => updateField('branding_description', e.target.value)}
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Describe tu plataforma de tutorías..."
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Esta descripción se mostrará en la página de inicio y metadatos SEO.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Save button */}
                        <div className="border-t border-gray-100 bg-gray-50 px-6 sm:px-8 py-4">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Guardando...
                                        </span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

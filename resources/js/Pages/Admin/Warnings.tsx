import { useState } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    AlertTriangle,
    Plus,
    User,
    CheckCircle,
    XCircle,
    Eye,
    X,
    Send,
    Shield,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface WarningItem {
    id: number;
    tutor_profile_id: number;
    comment: string;
    severity: string;
    created_at: string;
    tutor_profile?: {
        user?: { name: string; email: string; avatar?: string };
        specialties?: { id: number; name: string }[];
    };
    admin_reviewer?: { name: string };
}

interface TutorItem {
    id: number;
    user?: { name: string; email: string };
    specialties?: { name: string }[];
    total_warnings: number;
}

interface PageProps {
    warnings?: any;
    tutors?: TutorItem[];
}

const severityConfig: Record<string, { label: string; color: string; dot: string }> = {
    low: { label: 'Leve', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
    medium: { label: 'Moderada', color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-400' },
    high: { label: 'Grave', color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-400' },
};

export default function Warnings({ warnings: initialWarnings, tutors: initialTutors }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const warningsRaw = props.warnings?.data || props.warnings || initialWarnings || [];
    const warnings: WarningItem[] = Array.isArray(warningsRaw) ? warningsRaw : [];
    const pagination = props.warnings && props.warnings.current_page ? props.warnings : null;

    const tutorsRaw = props.tutors || initialTutors || [];
    const tutors: TutorItem[] = Array.isArray(tutorsRaw) ? tutorsRaw : [];

    const [showForm, setShowForm] = useState(false);
    const [filterSeverity, setFilterSeverity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);
    const [selectedTutorWarnings, setSelectedTutorWarnings] = useState<WarningItem[] | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        tutor_profile_id: '',
        reason: '',
        severity: 'low',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/warnings', {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    const handleViewTutorWarnings = (tutorId: number) => {
        const tutorWarnings = warnings.filter((w) => w.tutor_profile_id === tutorId);
        setSelectedTutorId(tutorId);
        setSelectedTutorWarnings(tutorWarnings);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredWarnings = warnings.filter((w) => {
        const matchSeverity = !filterSeverity || w.severity === filterSeverity;
        const matchSearch = !searchTerm ||
            (w.tutor_profile?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchSeverity && matchSearch;
    });

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-7 w-7 text-orange-500" />
                            Amonestaciones
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {warnings.length} amonestacion{warnings.length !== 1 ? 'es' : ''} registrada
                            {warnings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Amonestación
                    </button>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Crear</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Add Warning Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Emitir Nueva Amonestación
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    reset();
                                }}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Tutor *
                                    </label>
                                    <select
                                        value={data.tutor_profile_id}
                                        onChange={(e) => setData('tutor_profile_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                    >
                                        <option value="">Seleccionar tutor...</option>
                                        {tutors.map((tutor) => (
                                            <option key={tutor.id} value={tutor.id}>
                                                {tutor.user?.name || `Tutor #${tutor.id}`}
                                                {tutor.total_warnings > 0 ? ` (${tutor.total_warnings} alertas)` : ''}
                                                {tutor.specialties?.length ? ` — ${tutor.specialties.map(s => s.name).join(', ')}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tutor_profile_id && (
                                        <p className="text-red-500 text-xs mt-1">{errors.tutor_profile_id}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Severidad *
                                    </label>
                                    <div className="flex gap-2 mt-1">
                                        {Object.entries(severityConfig).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setData('severity', key)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                                                    data.severity === key
                                                        ? `${config.color} border-current`
                                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.severity && (
                                        <p className="text-red-500 text-xs mt-1">{errors.severity}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Motivo / Razón *
                                </label>
                                <textarea
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                                    placeholder="Describe el motivo de esta amonestación..."
                                />
                                {errors.reason && (
                                    <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        reset();
                                    }}
                                    className="border border-gray-300 text-gray-700 rounded-lg px-6 py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {processing ? 'Enviando...' : 'Emitir Amonestación'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Historial</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por tutor o motivo..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                { value: '', label: 'Todas' },
                                { value: 'low', label: 'Leves' },
                                { value: 'medium', label: 'Moderadas' },
                                { value: 'high', label: 'Graves' },
                            ].map((f) => (
                                <button
                                    key={f.value || 'all'}
                                    onClick={() => setFilterSeverity(f.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        filterSeverity === f.value
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Warnings List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Fecha
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Tutor
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Severidad
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Motivo
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Emitida por
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredWarnings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">
                                            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            No hay amonestaciones registradas
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWarnings.map((warning) => {
                                        const severity = severityConfig[warning.severity] || severityConfig.medium;
                                        const tutorName = warning.tutor_profile?.user?.name || `Tutor #${warning.tutor_profile_id}`;
                                        return (
                                            <tr
                                                key={warning.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                                                    {formatDate(warning.created_at)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {warning.tutor_profile?.user?.avatar ? (
                                                                <img src={warning.tutor_profile.user.avatar} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <User className="h-4 w-4 text-orange-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="text-sm font-medium text-gray-900 block truncate">
                                                                {tutorName}
                                                            </span>
                                                            <span className="text-xs text-gray-400 block truncate">
                                                                {warning.tutor_profile?.user?.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${severity.color}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${severity.dot}`} />
                                                        {severity.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-600 max-w-[250px] truncate">
                                                        {warning.comment || 'Sin motivo especificado'}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                                                    {warning.admin_reviewer?.name || '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => handleViewTutorWarnings(warning.tutor_profile_id)}
                                                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                                            title="Ver historial de este tutor"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {pagination.prev_page_url && (
                            <button
                                onClick={() => window.location.href = pagination.prev_page_url}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>
                        )}
                        <span className="text-sm text-gray-500">
                            Página {pagination.current_page} de {pagination.last_page}
                        </span>
                        {pagination.next_page_url && (
                            <button
                                onClick={() => window.location.href = pagination.next_page_url}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Tutor Warning History Modal */}
                {selectedTutorWarnings !== null && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-orange-500" />
                                    Historial de Amonestaciones
                                </h2>
                                <button
                                    onClick={() => {
                                        setSelectedTutorWarnings(null);
                                        setSelectedTutorId(null);
                                    }}
                                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">
                                    Tutor: <span className="font-bold text-gray-900">{tutors.find(t => t.id === selectedTutorId)?.user?.name || `Tutor #${selectedTutorId}`}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Total de alertas: {selectedTutorWarnings.length}
                                </p>
                            </div>

                            {selectedTutorWarnings.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">
                                    No hay amonestaciones para este tutor
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedTutorWarnings.map((w) => {
                                        const sev = severityConfig[w.severity] || severityConfig.medium;
                                        return (
                                            <div
                                                key={w.id}
                                                className={`border rounded-lg p-4 ${sev.color}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(w.created_at)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sev.color}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                                                        {sev.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    {w.comment || 'Sin motivo especificado'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                                <button
                                    onClick={() => {
                                        setSelectedTutorWarnings(null);
                                        setSelectedTutorId(null);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Mail,
    GraduationCap,
    CheckCircle,
    XCircle,
    Eye,
    FileText,
    Camera,
    Shield,
    X,
    MapPin,
    AlertTriangle,
} from 'lucide-react';
import type { TutorProfile } from '@/types';

interface PageProps {
    pendingTutors: TutorProfile[];
}

export default function PendingTutors({ pendingTutors: initialPendingTutors }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    // paginate() devuelve { data: [...], ...meta }, extraemos el array
    const pendingTutors = Array.isArray(props.pendingTutors)
        ? (props.pendingTutors as TutorProfile[])
        : ((props.pendingTutors?.data || initialPendingTutors || []) as TutorProfile[]);

    const [rejectingTutor, setRejectingTutor] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [expandedTutor, setExpandedTutor] = useState<number | null>(null);

    const handleApprove = (tutorId: number) => {
        if (confirm('¿Estás seguro de que deseas aprobar a este tutor? Podrá recibir sesiones de tutoría.')) {
            router.post(`/admin/tutors/${tutorId}/approve`);
        }
    };

    const handleReject = (tutorId: number) => {
        if (!rejectReason.trim()) {
            alert('Debes ingresar un motivo de rechazo');
            return;
        }
        router.post(`/admin/tutors/${tutorId}/reject`, { reason: rejectReason });
        setRejectingTutor(null);
        setRejectReason('');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-7 w-7 text-yellow-500" />
                            Tutores Pendientes de Aprobación
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Revisa y aprueba los perfiles de tutores que esperan verificación
                        </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {pendingTutors.length} pendiente{pendingTutors.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Solicitudes</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Tutor Cards */}
                {pendingTutors.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            ¡Todo al día!
                        </h3>
                        <p className="text-gray-500">No hay tutores pendientes de aprobación</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingTutors.map((tutor) => (
                            <div
                                key={tutor.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                {/* Main Row */}
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                        {/* Avatar & Basic Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="h-16 w-16 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                {tutor.user?.avatar ? (
                                                    <img
                                                        src={tutor.user.avatar}
                                                        alt={tutor.user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-indigo-600 font-bold text-xl">
                                                        {tutor.user?.name?.charAt(0) || 'T'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                    {tutor.user?.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {tutor.user?.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4" />
                                                    {tutor.user?.city || 'No especificada'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specialties */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                                Especialidades
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {tutor.specialties && tutor.specialties.length > 0 ? (
                                                    tutor.specialties.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                                                        >
                                                            {s.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">Sin especialidades</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 shrink-0">
                                            <button
                                                onClick={() =>
                                                    setExpandedTutor(
                                                        expandedTutor === tutor.id ? null : tutor.id
                                                    )
                                                }
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="hidden sm:inline">Ver Detalle</span>
                                            </button>
                                            <button
                                                onClick={() => handleApprove(tutor.id)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="hidden sm:inline">Aprobar</span>
                                            </button>
                                            <button
                                                onClick={() => setRejectingTutor(tutor.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <span className="hidden sm:inline">Rechazar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {expandedTutor === tutor.id && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {/* Professional Info */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                                        Información Profesional
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Título</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {tutor.professional_title || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Educación</p>
                                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                                                {tutor.education_level?.replace('_', ' ') || '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Experiencia</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {tutor.years_experience} años
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Tarifa</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {tutor.hourly_rate
                                                                    ? `${tutor.hourly_rate} tokens/hora`
                                                                    : 'No especificada'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bio */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                                        Biografía
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {tutor.user?.bio || 'Sin biografía'}
                                                    </p>
                                                </div>

                                                {/* Documents */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                                        Documentos
                                                    </p>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Camera className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Selfie</p>
                                                                {tutor.selfie_image ? (
                                                                    <img
                                                                        src={tutor.selfie_image}
                                                                        alt="Selfie"
                                                                        className="h-20 w-20 rounded-lg object-cover mt-1"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs text-red-500">No subido</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Cédula</p>
                                                                {tutor.id_card_image ? (
                                                                    <img
                                                                        src={tutor.id_card_image}
                                                                        alt="ID Card"
                                                                        className="h-20 w-20 rounded-lg object-cover mt-1"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs text-red-500">No subido</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <GraduationCap className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Título</p>
                                                                {tutor.title_document ? (
                                                                    <a
                                                                        href={tutor.title_document}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                                                    >
                                                                        Ver documento
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs text-red-500">No subido</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Registration Date */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                                                        Registro
                                                    </p>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Fecha de registro</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {tutor.created_at ? formatDate(tutor.created_at) : '—'}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-xs text-gray-500">Contacto</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {tutor.user?.phone || '—'}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3">
                                                        <p className="text-xs text-gray-500">Dirección</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {tutor.user?.address || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                {rejectingTutor && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Rechazar Tutor</h2>
                                <button
                                    onClick={() => {
                                        setRejectingTutor(null);
                                        setRejectReason('');
                                    }}
                                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mb-4 bg-red-50 rounded-lg p-3">
                                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                <p className="text-sm text-red-700">
                                    Se notificará al tutor con el motivo del rechazo.
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                    placeholder="Describe por qué se está rechazando este perfil..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setRejectingTutor(null);
                                        setRejectReason('');
                                    }}
                                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleReject(rejectingTutor)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium transition-colors"
                                >
                                    Confirmar Rechazo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

import { useRef, useState } from 'react';
import { usePage, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    FileText,
    Upload,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Star,
    BookOpen,
    MessageSquare,
    ArrowLeft,
    AlertTriangle,
    Send,
    Calendar,
    GraduationCap,
    Coins,
} from 'lucide-react';

interface TutorOption {
    id: number;
    user: { name: string };
    specialties: { id: number; name: string }[];
    average_rating: number;
    hourly_rate: number;
}

interface LevelCosts {
    pregrado: number;
    maestria: number;
    doctorado: number;
}

interface PageProps {
    tutors: TutorOption[];
    levelCosts: LevelCosts;
}

const LEVEL_OPTIONS = [
    { value: 'pregrado', label: 'Pregrado' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
];

export default function ThesisCreate({ tutors, levelCosts }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const { data, setData, post, processing, errors, reset } = useForm({
        tutor_profile_id: '',
        title: '',
        academic_level: '',
        subject_area: '',
        instructions: '',
        file: null as File | null,
    });

    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');

    const selectedLevelCost = data.academic_level ? levelCosts[data.academic_level as keyof LevelCosts] : null;

    const handleFileChange = (file: File | null) => {
        if (file) {
            setData('file', file);
            setFileName(file.name);
        } else {
            setData('file', null);
            setFileName('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/thesis', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileName('');
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
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
                <Link
                    href="/student/thesis"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Revisiones de Tesis
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Nueva Revisión de Tesis</h1>
                        <p className="text-gray-500">Solicita una revisión profesional de tu tesis</p>
                    </div>
                </div>

                {/* Token Cost Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Coins className="h-5 w-5 text-amber-500" />
                        Costo por Nivel Académico
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {LEVEL_OPTIONS.map((level) => (
                            <div
                                key={level.value}
                                className={`rounded-xl p-4 border-2 transition-colors cursor-pointer ${
                                    data.academic_level === level.value
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
                                }`}
                                onClick={() => setData('academic_level', level.value)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{level.label}</p>
                                        <p className="text-sm text-indigo-600 font-medium">
                                            {levelCosts[level.value as keyof LevelCosts]} tokens
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Datos de la Tesis
                        </h2>

                        {/* Tutor Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Tutor
                            </label>
                            <select
                                value={data.tutor_profile_id}
                                onChange={(e) => setData('tutor_profile_id', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                                    errors.tutor_profile_id
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-indigo-500'
                                }`}
                            >
                                <option value="">Seleccionar un tutor...</option>
                                {tutors.map((tutor) => (
                                    <option key={tutor.id} value={tutor.id}>
                                        {tutor.user.name} — {Number(tutor.average_rating) > 0 ? `${Number(tutor.average_rating).toFixed(1)} ★` : 'Sin calificación'} — {tutor.hourly_rate} tokens/h
                                    </option>
                                ))}
                            </select>
                            {errors.tutor_profile_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.tutor_profile_id}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Título de la Tesis
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ej: Análisis de impacto ambiental en zonas urbanas"
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                                    errors.title
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-indigo-500'
                                }`}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Academic Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <GraduationCap className="h-4 w-4 inline mr-1" />
                                Nivel Académico
                            </label>
                            <select
                                value={data.academic_level}
                                onChange={(e) => setData('academic_level', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                                    errors.academic_level
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-indigo-500'
                                }`}
                            >
                                <option value="">Seleccionar nivel...</option>
                                {LEVEL_OPTIONS.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label} — {levelCosts[level.value as keyof LevelCosts]} tokens
                                    </option>
                                ))}
                            </select>
                            {errors.academic_level && (
                                <p className="text-red-500 text-xs mt-1">{errors.academic_level}</p>
                            )}
                        </div>

                        {/* Subject Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Área Temática
                            </label>
                            <input
                                type="text"
                                value={data.subject_area}
                                onChange={(e) => setData('subject_area', e.target.value)}
                                placeholder="Ej: Ingeniería Ambiental, Derecho Constitucional..."
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
                                    errors.subject_area
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-indigo-500'
                                }`}
                            />
                            {errors.subject_area && (
                                <p className="text-red-500 text-xs mt-1">{errors.subject_area}</p>
                            )}
                        </div>

                        {/* Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <MessageSquare className="h-4 w-4 inline mr-1" />
                                Instrucciones para el Tutor
                            </label>
                            <textarea
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={4}
                                placeholder="Describe qué aspectos deseas que el tutor revise: estructura, redacción, contenido, metodología, referencias..."
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none ${
                                    errors.instructions
                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-indigo-500'
                                }`}
                            />
                            {errors.instructions && (
                                <p className="text-red-500 text-xs mt-1">{errors.instructions}</p>
                            )}
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Upload className="h-4 w-4 inline mr-1" />
                                Archivo PDF de la Tesis
                            </label>
                            <div
                                onClick={() => fileRef.current?.click()}
                                className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-indigo-50 ${
                                    errors.file ? 'border-red-300 bg-red-50 hover:bg-red-100' : fileName ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                                }`}
                            >
                                {fileName ? (
                                    <>
                                        <FileText className="h-10 w-10 text-indigo-500 mb-2" />
                                        <p className="text-sm font-medium text-gray-900">{fileName}</p>
                                        <p className="text-xs text-gray-400 mt-1">Haz clic para cambiar el archivo</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium text-gray-500">Haz clic para subir tu tesis</p>
                                        <p className="text-xs text-gray-400 mt-1">Solo archivos PDF</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            />
                            {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                            )}
                        </div>
                    </div>

                    {/* General Validation Errors */}
                    {Object.keys(errors).length > 0 && !errors.title && !errors.tutor_profile_id && !errors.academic_level && !errors.file && !errors.subject_area && !errors.instructions && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {Object.values(errors).map((error, i) => (
                                <p key={i}>{String(error)}</p>
                            ))}
                        </div>
                    )}

                    {/* Cost Summary + Submit */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                {selectedLevelCost ? (
                                    <p className="text-gray-600">
                                        Costo de la revisión:{' '}
                                        <span className="text-lg font-bold text-indigo-600">{selectedLevelCost} tokens</span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        Selecciona un nivel académémico para ver el costo
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-semibold transition-colors shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Solicitar Revisión
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

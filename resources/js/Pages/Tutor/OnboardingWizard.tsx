import { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    User,
    GraduationCap,
    BookOpen,
    Upload,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    ArrowRight,
    Camera,
    FileText,
    Save,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface Specialty {
    id: number;
    name: string;
    description?: string;
    tokens_cost?: number;
    is_active?: boolean;
}

interface PageProps {
    specialties: Specialty[];
}

/* ------------------------------------------------------------------ */
/*  Step metadata                                                      */
/* ------------------------------------------------------------------ */

const STEPS = [
    { number: 1, label: 'Información Personal', icon: User },
    { number: 2, label: 'Información Profesional', icon: GraduationCap },
    { number: 3, label: 'Especialidades', icon: BookOpen },
    { number: 4, label: 'Documentos', icon: Upload },
] as const;

const EDUCATION_OPTIONS = [
    { value: 'bachillerato', label: 'Bachillerato' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'licenciatura', label: 'Licenciatura' },
    { value: 'ingenieria', label: 'Ingeniería' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
    { value: 'otro', label: 'Otro' },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TutorOnboardingWizard({ specialties }: PageProps) {
    const [currentStep, setCurrentStep] = useState(1);

    /* ---- form ---------------------------------------------------- */
    const { data, setData, processing, errors, clearErrors } = useForm({
        // Step 1
        name: '',
        phone: '',
        city: '',
        country: '',
        bio: '',
        // Step 2
        professional_title: '',
        education_level: '',
        years_experience: 0,
        hourly_rate: '',
        // Step 3
        specialties: [] as number[],
        // Step 4
        selfie_image: null as File | null,
        id_card_image: null as File | null,
        title_document: null as File | null,
    });

    /* ---- file previews ------------------------------------------- */
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
    const [titleDocName, setTitleDocName] = useState<string | null>(null);

    const selfieRef = useRef<HTMLInputElement>(null);
    const idCardRef = useRef<HTMLInputElement>(null);
    const titleDocRef = useRef<HTMLInputElement>(null);

    /* ---- helpers ------------------------------------------------- */
    const handleFileChange = (
        field: 'selfie_image' | 'id_card_image' | 'title_document',
        file: File | null,
    ) => {
        if (!file) return;
        setData(field, file);

        if (field === 'title_document') {
            setTitleDocName(file.name);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (field === 'selfie_image') setSelfiePreview(result);
            else setIdCardPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = (field: 'selfie_image' | 'id_card_image' | 'title_document') => {
        setData(field, null);
        if (field === 'selfie_image') setSelfiePreview(null);
        if (field === 'id_card_image') setIdCardPreview(null);
        if (field === 'title_document') setTitleDocName(null);
    };

    const handleSpecialtyToggle = (id: number) => {
        const current = data.specialties;
        setData(
            'specialties',
            current.includes(id) ? current.filter((s) => s !== id) : [...current, id],
        );
    };

    /* ---- step navigation ----------------------------------------- */
    const totalSteps = STEPS.length;

    const canAdvance = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!(data.name && data.phone && data.city && data.country);
            case 2:
                return !!(
                    data.professional_title &&
                    data.education_level &&
                    data.years_experience >= 0 &&
                    data.hourly_rate
                );
            case 3:
                return data.specialties.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const goNext = () => {
        if (currentStep < totalSteps && canAdvance()) {
            setCurrentStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goPrev = () => {
        if (currentStep > 1) {
            clearErrors();
            setCurrentStep((s) => s - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /* ---- submit -------------------------------------------------- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/tutor/profile',
            {
                ...data,
                _method: 'PUT',
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    router.visit('/tutor/dashboard');
                },
            },
        );
    };

    /* ---- progress bar width -------------------------------------- */
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

    /* ---- shared input class -------------------------------------- */
    const inputClass =
        'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';
    const selectClass =
        'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    /* ================================================================ */
    /*  RENDER                                                           */
    /* ================================================================ */

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-3xl space-y-6 pb-12">
                {/* ---------- Header ---------- */}
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <GraduationCap className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Bienvenido, futuro tutor
                        </h1>
                        <p className="text-gray-500">
                            Completa los siguientes pasos para activar tu perfil de tutor.
                        </p>
                    </div>
                </div>

                {/* ---------- Progress bar ---------- */}
                <div className="overflow-hidden rounded-full bg-gray-200 h-3">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* ---------- Step indicators ---------- */}
                <nav aria-label="Pasos del wizard" className="flex gap-1 sm:gap-2">
                    {STEPS.map((step) => {
                        const isCompleted = currentStep > step.number;
                        const isActive = currentStep === step.number;
                        const Icon = step.icon;

                        return (
                            <button
                                key={step.number}
                                type="button"
                                disabled={currentStep < step.number}
                                onClick={() => {
                                    if (step.number < currentStep) {
                                        clearErrors();
                                        setCurrentStep(step.number);
                                    }
                                }}
                                className={`group flex flex-1 items-center gap-2 rounded-xl px-2 py-3 text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-default
                                    ${
                                        isCompleted
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 cursor-pointer'
                                            : isActive
                                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                              : 'bg-gray-50 text-gray-400 ring-1 ring-gray-100'
                                    }`}
                            >
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors
                                    ${
                                        isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : isActive
                                              ? 'bg-indigo-600 text-white'
                                              : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        step.number
                                    )}
                                </span>
                                <span className="hidden sm:inline truncate">{step.label}</span>
                                <Icon className="hidden h-4 w-4 sm:block ml-auto shrink-0 opacity-60" />
                            </button>
                        );
                    })}
                </nav>

                {/* ---------- Form ---------- */}
                <form onSubmit={handleSubmit}>
                    <div className="rounded-xl bg-white p-5 shadow-lg ring-1 ring-gray-100 sm:p-8">
                        {/* ============================================================ */}
                        {/*  STEP 1 – Información Personal                                */}
                        {/* ============================================================ */}
                        {currentStep === 1 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Información Personal
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Cuéntanos quién eres para que los estudiantes te conozcan.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {/* Nombre */}
                                    <div>
                                        <label className={labelClass}>Nombre Completo *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ej: María García López"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className={labelClass}>Teléfono *</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={inputClass}
                                            placeholder="+1 234 567 8900"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Ciudad */}
                                    <div>
                                        <label className={labelClass}>Ciudad *</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ej: Santo Domingo"
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                                        )}
                                    </div>

                                    {/* País */}
                                    <div>
                                        <label className={labelClass}>País *</label>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ej: República Dominicana"
                                        />
                                        {errors.country && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.country}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Biografía</label>
                                        <textarea
                                            value={data.bio}
                                            onChange={(e) => setData('bio', e.target.value)}
                                            rows={4}
                                            maxLength={2000}
                                            className={`${inputClass} resize-none`}
                                            placeholder="Cuéntanos sobre ti, tu experiencia y tu pasión por enseñar..."
                                        />
                                        <p className="mt-1 text-xs text-gray-400">
                                            {data.bio?.length || 0}/2000 caracteres
                                        </p>
                                        {errors.bio && (
                                            <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ============================================================ */}
                        {/*  STEP 2 – Información Profesional                             */}
                        {/* ============================================================ */}
                        {currentStep === 2 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Información Profesional
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Comparte tu formación y experiencia académica.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {/* Título */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Título Profesional *</label>
                                        <input
                                            type="text"
                                            value={data.professional_title}
                                            onChange={(e) =>
                                                setData('professional_title', e.target.value)
                                            }
                                            className={inputClass}
                                            placeholder="Ej: Licenciada en Matemáticas"
                                        />
                                        {errors.professional_title && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.professional_title}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nivel de educación */}
                                    <div>
                                        <label className={labelClass}>Nivel de Educación *</label>
                                        <select
                                            value={data.education_level}
                                            onChange={(e) => setData('education_level', e.target.value)}
                                            className={selectClass}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {EDUCATION_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.education_level && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.education_level}
                                            </p>
                                        )}
                                    </div>

                                    {/* Años de experiencia */}
                                    <div>
                                        <label className={labelClass}>Años de Experiencia *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.years_experience}
                                            onChange={(e) =>
                                                setData(
                                                    'years_experience',
                                                    parseInt(e.target.value) || 0,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                        {errors.years_experience && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.years_experience}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tarifa por hora */}
                                    <div>
                                        <label className={labelClass}>Tarifa por Hora (Tokens) *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.hourly_rate}
                                            onChange={(e) => setData('hourly_rate', e.target.value)}
                                            className={inputClass}
                                            placeholder="Ej: 5"
                                        />
                                        {errors.hourly_rate && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.hourly_rate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ============================================================ */}
                        {/*  STEP 3 – Especialidades                                      */}
                        {/* ============================================================ */}
                        {currentStep === 3 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Especialidades
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Selecciona al menos una área en la que puedas impartir
                                            tutorías.
                                        </p>
                                    </div>
                                </div>

                                {specialties.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
                                        No hay especialidades disponibles en este momento.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {specialties.map((specialty) => {
                                        const isSelected = data.specialties.includes(specialty.id);

                                        return (
                                            <label
                                                key={specialty.id}
                                                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSpecialtyToggle(specialty.id)}
                                                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {specialty.name}
                                                    </p>
                                                    {specialty.description && (
                                                        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                                                            {specialty.description}
                                                        </p>
                                                    )}
                                                    {specialty.tokens_cost != null && (
                                                        <p className="mt-1 text-xs font-semibold text-indigo-600">
                                                            {specialty.tokens_cost} tokens/hora
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {errors.specialties && (
                                    <p className="text-xs text-red-500">{errors.specialties}</p>
                                )}

                                <p className="text-xs text-gray-400">
                                    Seleccionadas:{' '}
                                    <span className="font-semibold text-indigo-600">
                                        {data.specialties.length}
                                    </span>
                                </p>
                            </section>
                        )}

                        {/* ============================================================ */}
                        {/*  STEP 4 – Documentos                                          */}
                        {/* ============================================================ */}
                        {currentStep === 4 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Documentos de Verificación
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Sube los documentos necesarios para verificar tu identidad
                                            y titulación.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    {/* ---- Selfie ---- */}
                                    <div>
                                        <label className={labelClass}>
                                            <Camera className="mr-1 inline h-4 w-4" />
                                            Selfie de Identificación
                                        </label>
                                        <div
                                            onClick={() => selfieRef.current?.click()}
                                            className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                                        >
                                            {selfiePreview ? (
                                                <>
                                                    <img
                                                        src={selfiePreview}
                                                        alt="Vista previa selfie"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile('selfie_image');
                                                        }}
                                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-center p-4">
                                                    <Camera className="mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="text-sm text-gray-500">
                                                        Haz clic para subir
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        JPG, PNG (máx. 5 MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={selfieRef}
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            className="hidden"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    'selfie_image',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {errors.selfie_image && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.selfie_image}
                                            </p>
                                        )}
                                    </div>

                                    {/* ---- Cédula ---- */}
                                    <div>
                                        <label className={labelClass}>
                                            <FileText className="mr-1 inline h-4 w-4" />
                                            Cédula / Documento de Identidad
                                        </label>
                                        <div
                                            onClick={() => idCardRef.current?.click()}
                                            className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                                        >
                                            {idCardPreview ? (
                                                <>
                                                    <img
                                                        src={idCardPreview}
                                                        alt="Vista previa cédula"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile('id_card_image');
                                                        }}
                                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-center p-4">
                                                    <FileText className="mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="text-sm text-gray-500">
                                                        Haz clic para subir
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        JPG, PNG (máx. 5 MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={idCardRef}
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            className="hidden"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    'id_card_image',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {errors.id_card_image && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.id_card_image}
                                            </p>
                                        )}
                                    </div>

                                    {/* ---- Título ---- */}
                                    <div>
                                        <label className={labelClass}>
                                            <FileText className="mr-1 inline h-4 w-4" />
                                            Título Profesional
                                        </label>
                                        <div
                                            onClick={() => titleDocRef.current?.click()}
                                            className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
                                        >
                                            {titleDocName ? (
                                                <div className="p-4 text-center">
                                                    <FileText className="mx-auto mb-2 h-8 w-8 text-indigo-500" />
                                                    <p className="break-all text-sm font-medium text-gray-700">
                                                        {titleDocName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">PDF</p>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile('title_document');
                                                        }}
                                                        className="mt-2 text-xs font-medium text-red-500 hover:text-red-700"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-center p-4">
                                                    <FileText className="mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="text-sm text-gray-500">
                                                        Haz clic para subir
                                                    </p>
                                                    <p className="text-xs text-gray-400">PDF (máx. 10 MB)</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={titleDocRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    'title_document',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        {errors.title_document && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.title_document}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
                                    Tus documentos serán revisados por nuestro equipo antes de activar
                                    tu perfil. La información es tratada con total privacidad y
                                    seguridad.
                                </p>
                            </section>
                        )}
                    </div>

                    {/* ---------- Navigation buttons ---------- */}
                    <div className="mt-6 flex items-center justify-between">
                        {/* Previous */}
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={goPrev}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </button>
                        ) : (
                            <div />
                        )}

                        {/* Next / Submit */}
                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={!canAdvance()}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Save className="h-5 w-5 animate-pulse" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="h-5 w-5" />
                                        Enviar Solicitud
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

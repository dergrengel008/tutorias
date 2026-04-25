import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Calendar,
    Plus,
    Trash2,
    Clock,
    CheckCircle,
    Save,
    X,
} from 'lucide-react';

interface Availability {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface PageProps {
    availabilities: Availability[];
    daysSpanish: Record<string, string>;
}

const DAY_ORDER = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

const DAY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; iconBg: string }> = {
    monday:    { bg: 'bg-blue-50',     border: 'border-blue-200',     text: 'text-blue-800',     badge: 'bg-blue-100 text-blue-700',     iconBg: 'bg-blue-100 text-blue-600' },
    tuesday:   { bg: 'bg-purple-50',   border: 'border-purple-200',   text: 'text-purple-800',   badge: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100 text-purple-600' },
    wednesday: { bg: 'bg-indigo-50',   border: 'border-indigo-200',   text: 'text-indigo-800',   badge: 'bg-indigo-100 text-indigo-700', iconBg: 'bg-indigo-100 text-indigo-600' },
    thursday:  { bg: 'bg-violet-50',   border: 'border-violet-200',   text: 'text-violet-800',   badge: 'bg-violet-100 text-violet-700', iconBg: 'bg-violet-100 text-violet-600' },
    friday:    { bg: 'bg-fuchsia-50',  border: 'border-fuchsia-200',  text: 'text-fuchsia-800',  badge: 'bg-fuchsia-100 text-fuchsia-700', iconBg: 'bg-fuchsia-100 text-fuchsia-600' },
    saturday:  { bg: 'bg-amber-50',    border: 'border-amber-200',    text: 'text-amber-800',    badge: 'bg-amber-100 text-amber-700',    iconBg: 'bg-amber-100 text-amber-600' },
    sunday:    { bg: 'bg-rose-50',     border: 'border-rose-200',     text: 'text-rose-800',     badge: 'bg-rose-100 text-rose-700',     iconBg: 'bg-rose-100 text-rose-600' },
};

export default function Availability({ availabilities, daysSpanish }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        day_of_week: 'monday',
        start_time: '08:00',
        end_time: '09:00',
    });

    // Group availabilities by day
    const groupedByDay = DAY_ORDER.map((day) => ({
        key: day,
        label: daysSpanish[day] || day,
        slots: availabilities
            .filter((a) => a.day_of_week === day)
            .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tutor/availability', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) return;

        setDeletingId(id);
        router.delete(`/tutor/availability/${id}`, {
            onFinish: () => setDeletingId(null),
        });
    };

    const toggleForm = () => {
        if (showForm) {
            reset();
        }
        setShowForm((prev) => !prev);
    };

    return (
        <DashboardLayout>
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
                        <X className="h-5 w-5 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{flash.error}</p>
                    </div>
                )}
                {wasSuccessful && !flash?.success && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800 text-sm">Horario agregado correctamente.</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="h-7 w-7 text-indigo-500" />
                            Mi Disponibilidad
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Administra tus horarios disponibles para que los estudiantes puedan reservar sesiones contigo.
                        </p>
                    </div>
                    <button
                        onClick={toggleForm}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-md ${
                            showForm
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {showForm ? (
                            <>
                                <X className="h-4 w-4" />
                                Cancelar
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Agregar Horario
                            </>
                        )}
                    </button>
                </div>

                {/* Add Availability Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                            <Plus className="h-5 w-5 text-indigo-500" />
                            Agregar Nuevo Horario
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {/* Day selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Día de la Semana
                                    </label>
                                    <select
                                        value={data.day_of_week}
                                        onChange={(e) => setData('day_of_week', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white"
                                    >
                                        {DAY_ORDER.map((day) => (
                                            <option key={day} value={day}>
                                                {daysSpanish[day] || day}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.day_of_week && (
                                        <p className="text-red-500 text-xs mt-1">{errors.day_of_week}</p>
                                    )}
                                </div>

                                {/* Start time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Hora de Inicio
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        required
                                    />
                                    {errors.start_time && (
                                        <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                {/* End time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Hora de Fin
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        required
                                    />
                                    {errors.end_time && (
                                        <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* General form error */}
                            {errors.message && (
                                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                    {errors.message}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Guardar Horario
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Schedule Grid */}
                {availabilities.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No tienes horarios configurados
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Agrega tus horarios de disponibilidad para que los estudiantes puedan reservar sesiones contigo.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors shadow-md"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar mi primer horario
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {groupedByDay.map((day) => {
                            const colors = DAY_COLORS[day.key] || DAY_COLORS.monday;

                            return (
                                <div
                                    key={day.key}
                                    className={`bg-white rounded-xl shadow-lg overflow-hidden`}
                                >
                                    {/* Day header */}
                                    <div className={`${colors.bg} ${colors.border} border-b px-5 py-4`}>
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-semibold ${colors.text} flex items-center gap-2`}>
                                                <div className={`h-8 w-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                {day.label}
                                            </h3>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                                                {day.slots.length} {day.slots.length === 1 ? 'horario' : 'horarios'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Slots */}
                                    <div className="p-4">
                                        {day.slots.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-4 italic">
                                                Sin horarios este día
                                            </p>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {day.slots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 px-4 py-3 transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                                <Clock className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {slot.start_time} — {slot.end_time}
                                                                </p>
                                                                {slot.is_active && (
                                                                    <div className="flex items-center gap-1 mt-0.5">
                                                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                                        <span className="text-xs text-emerald-600 font-medium">Activo</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDelete(slot.id)}
                                                            disabled={deletingId === slot.id}
                                                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Eliminar horario"
                                                        >
                                                            {deletingId === slot.id ? (
                                                                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                </svg>
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary */}
                {availabilities.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-5">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                <span>
                                    Total: <strong className="text-gray-900">{availabilities.length}</strong> horario{availabilities.length !== 1 ? 's' : ''} configurado{availabilities.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                <span>
                                    Activos: <strong className="text-gray-900">{availabilities.filter((a) => a.is_active).length}</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-gray-300" />
                                <span>
                                    Días con disponibilidad:{' '}
                                    <strong className="text-gray-900">
                                        {new Set(availabilities.map((a) => a.day_of_week)).size}
                                    </strong>{' '}
                                    de 7
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

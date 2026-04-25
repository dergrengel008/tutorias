import { useState } from 'react';
import { usePage, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus,
    Edit,
    Trash,
    Award,
    X,
    Save,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import type { Specialty } from '@/types';

interface PageProps {
    specialties: Specialty[];
}

export default function ManageSpecialties({ specialties: initialSpecialties }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const specialties = (props.specialties || initialSpecialties) as Specialty[];

    const [showForm, setShowForm] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        icon: '',
    });

    const openCreateForm = () => {
        setEditingSpecialty(null);
        setData('name', '');
        setData('description', '');
        setData('icon', '');
        setShowForm(true);
    };

    const openEditForm = (specialty: Specialty) => {
        setEditingSpecialty(specialty);
        setData('name', specialty.name);
        setData('description', specialty.description || '');
        setData('icon', specialty.icon || '');
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSpecialty) {
            put(`/admin/specialties/${editingSpecialty.id}`, {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                    setEditingSpecialty(null);
                },
            });
        } else {
            post('/admin/specialties', {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (specialtyId: number) => {
        if (confirm('¿Estás seguro de eliminar esta especialidad? Los tutores con esta especialidad perderán la asociación.')) {
            router.delete(`/admin/specialties/${specialtyId}`);
        }
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
                            <Award className="h-7 w-7 text-indigo-500" />
                            Gestionar Especialidades
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {specialties.length} especialidade{specialties.length !== 1 ? 's' : ''} registrada
                            {specialties.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Especialidad
                    </button>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Catálogo</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSpecialty(null);
                                        reset();
                                    }}
                                    className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="Ej: Matemáticas"
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                        placeholder="Descripción breve de la especialidad..."
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Icono (clase CSS o emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        placeholder="Ej: 📐 o fa-calculator"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingSpecialty(null);
                                            reset();
                                        }}
                                        className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Guardando...' : editingSpecialty ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Specialties List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {specialties.map((specialty) => (
                        <div
                            key={specialty.id}
                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                                    {specialty.icon || '📚'}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditForm(specialty)}
                                        className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center text-gray-500 transition-colors"
                                       
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(specialty.id)}
                                        className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-gray-500 transition-colors"
                                       
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{specialty.name}</h3>
                            {specialty.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {specialty.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-3">
                                Creada: {specialty.created_at ? formatDate(specialty.created_at) : '—'}
                            </p>
                        </div>
                    ))}
                </div>

                {specialties.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay especialidades
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Crea la primera especialidad para que los tutores puedan seleccionarla
                        </p>
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Crear Especialidad
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

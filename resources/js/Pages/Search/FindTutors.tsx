import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import {
    Search,
    Star,
    MapPin,
    DollarSign,
    GraduationCap,
    Filter,
    ChevronLeft,
    ChevronRight,
    Clock,
} from 'lucide-react';
import type { TutorProfile, Specialty } from '@/types';

interface PageProps {
    tutors: TutorProfile[];
    specialties: Specialty[];
    filters?: {
        search?: string;
        specialty_id?: number;
        city?: string;
        min_rating?: number;
        min_price?: number;
        max_price?: number;
    };
}

export default function FindTutors({ tutors: initialTutors, specialties, filters: initialFilters }: PageProps) {
    const { props } = usePage();

    const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
    const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>(
        initialFilters?.specialty_id ? [initialFilters.specialty_id] : []
    );
    const [city, setCity] = useState(initialFilters?.city || '');
    const [minRating, setMinRating] = useState(initialFilters?.min_rating || 0);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        initialFilters?.min_price || 0,
        initialFilters?.max_price || 100,
    ]);
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = () => {
        router.get('/buscar-tutores', {
            search: searchTerm || undefined,
            specialty_id: selectedSpecialties.length === 1 ? selectedSpecialties[0] : undefined,
            city: city || undefined,
            min_rating: minRating || undefined,
            min_price: priceRange[0] || undefined,
            max_price: priceRange[1] || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSpecialties([]);
        setCity('');
        setMinRating(0);
        setPriceRange([0, 100]);
        router.get('/buscar-tutores', {}, { preserveState: true });
    };

    const handleSpecialtyToggle = (id: number) => {
        setSelectedSpecialties((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    const tutors = (props.tutors || initialTutors) as TutorProfile[];

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Search Section */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                Encuentra tu Tutor Perfecto
                            </h1>
                            <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
                                Explora tutores calificados en diversas materias y comienza tu aprendizaje hoy
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                        placeholder="Buscar por nombre, materia o especialidad..."
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 border-0 shadow-lg focus:ring-4 focus:ring-indigo-300 outline-none text-base"
                                    />
                                </div>
                                <button
                                    onClick={applyFilters}
                                    className="bg-white text-indigo-700 font-semibold rounded-xl px-6 py-3.5 shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                >
                                    <Search className="h-5 w-5" />
                                    <span className="hidden sm:inline">Buscar</span>
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`lg:hidden bg-white/20 text-white rounded-xl px-4 py-3.5 transition-colors flex items-center gap-2 ${
                                        showFilters ? 'bg-white/30' : 'hover:bg-white/30'
                                    }`}
                                >
                                    <Filter className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* Sidebar Filters */}
                        <aside
                            className={`${
                                showFilters ? 'block' : 'hidden'
                            } lg:block w-full lg:w-72 shrink-0`}
                        >
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-indigo-500" />
                                        Filtros
                                    </h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-500 hover:text-red-500 font-medium"
                                    >
                                        Limpiar
                                    </button>
                                </div>

                                {/* Specialty Filters */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Especialidades</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {specialties.map((specialty) => (
                                            <label
                                                key={specialty.id}
                                                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                                    selectedSpecialties.includes(specialty.id)
                                                        ? 'bg-indigo-50'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSpecialties.includes(specialty.id)}
                                                    onChange={() => handleSpecialtyToggle(specialty.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">{specialty.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* City Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Ciudad</h3>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Escribe una ciudad..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>

                                {/* Rating Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Calificación Mínima
                                    </h3>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setMinRating(rating)}
                                                className="transition-colors"
                                            >
                                                <Star
                                                    className={`h-6 w-6 ${
                                                        rating <= minRating
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-gray-300 hover:text-amber-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {minRating > 0 && (
                                        <button
                                            onClick={() => setMinRating(0)}
                                            className="text-xs text-gray-500 hover:text-red-500 mt-1"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        <DollarSign className="h-4 w-4 inline mr-1" />
                                        Rango de Precio (Tokens)
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange[0]}
                                            onChange={(e) =>
                                                setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="Min"
                                        />
                                        <span className="text-gray-400">—</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={priceRange[1]}
                                            onChange={(e) =>
                                                setPriceRange([priceRange[0], parseInt(e.target.value) || 100])
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-medium transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </aside>

                        {/* Results */}
                        <main className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-gray-600">
                                    <span className="font-semibold text-gray-900">{tutors.length}</span>{' '}
                                    tutor{tutors.length !== 1 ? 'es' : ''} encontrado
                                    {tutors.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {tutors.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No se encontraron tutores
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Intenta ajustar tus filtros o busca con otros términos
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {tutors.map((tutor) => (
                                        <a
                                            key={tutor.id}
                                            href={`/tutors/${tutor.id}`}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                        >
                                            {/* Card Header */}
                                            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                                                <div className="absolute -bottom-8 left-6">
                                                    <div className="h-16 w-16 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
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
                                                </div>
                                                {tutor.average_rating > 0 && (
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                                                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-xs font-semibold text-gray-900">
                                                            {tutor.average_rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-6 pt-10">
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors truncate">
                                                    {tutor.user?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5 truncate">
                                                    {tutor.professional_title || 'Tutor'}
                                                </p>

                                                {/* Specialties */}
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {tutor.specialties?.slice(0, 3).map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                                                        >
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                    {tutor.specialties && tutor.specialties.length > 3 && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                            +{tutor.specialties.length - 3}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="mt-4 space-y-2">
                                                    {tutor.user?.city && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <MapPin className="h-4 w-4 shrink-0" />
                                                            <span className="truncate">{tutor.user.city}</span>
                                                        </div>
                                                    )}
                                                    {tutor.hourly_rate && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <DollarSign className="h-4 w-4 shrink-0" />
                                                            <span>{tutor.hourly_rate} tokens/hora</span>
                                                        </div>
                                                    )}
                                                    {tutor.years_experience > 0 && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Clock className="h-4 w-4 shrink-0" />
                                                            <span>
                                                                {tutor.years_experience} año
                                                                {tutor.years_experience !== 1 ? 's' : ''} de
                                                                experiencia
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                {tutor.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 mt-3">
                                                        {renderStars(tutor.average_rating)}
                                                        <span className="text-xs text-gray-400 ml-1">
                                                            ({tutor.total_sessions} sesiones)
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Action */}
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <span className="block text-center bg-indigo-50 text-indigo-700 rounded-lg py-2 text-sm font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        Ver Perfil
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {tutors.length > 0 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">
                                        1
                                    </button>
                                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                        2
                                    </button>
                                    <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                        3
                                    </button>
                                    <span className="px-2 py-2 text-gray-400">...</span>
                                    <button className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}

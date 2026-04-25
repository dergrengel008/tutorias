import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Search, Star, MapPin, Clock, Award, Filter } from 'lucide-react';

interface TutorData {
    id: number;
    user?: { name: string; avatar?: string; city?: string; country?: string };
    professional_title?: string;
    hourly_rate?: number;
    average_rating?: number;
    total_sessions?: number;
    years_experience?: number;
    specialties?: { id: number; name: string }[];
}

interface Specialty {
    id: number;
    name: string;
}

interface PageProps {
    tutors?: TutorData[];
    query?: string;
    specialties?: Specialty[];
}

export default function SearchResults({ tutors: rawTutors, query: rawQuery, specialties: rawSpecialties }: PageProps) {
    const tutors = Array.isArray(rawTutors) ? rawTutors : (rawTutors?.data || []);
    const specialties = Array.isArray(rawSpecialties) ? rawSpecialties : [];
    const query = rawQuery || '';

    const [search, setSearch] = useState(query);
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);

    const filtered = tutors.filter((t) => {
        const matchesSearch = !search || t.user?.name?.toLowerCase().includes(search.toLowerCase()) || t.professional_title?.toLowerCase().includes(search.toLowerCase());
        const matchesSpec = !selectedSpecialty || t.specialties?.some((s) => s.id === selectedSpecialty);
        return matchesSearch && matchesSpec;
    });

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Buscar Tutores</h1>
                        <p className="text-gray-500 mt-2">Encuentra el tutor perfecto para tu aprendizaje</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4">
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="¿Qué quieres aprender?" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-base" />
                        </div>
                        {specialties.length > 0 && (
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <button onClick={() => setSelectedSpecialty(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!selectedSpecialty ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                                {specialties.map((s) => (
                                    <button key={s.id} onClick={() => setSelectedSpecialty(s.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSpecialty === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.name}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mb-4">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>

                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
                            <p className="text-gray-500">Intenta con otros términos de búsqueda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((tutor) => (
                                <div key={tutor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-16 w-16 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                {tutor.user?.avatar ? <img src={tutor.user.avatar} alt={tutor.user.name} className="h-full w-full object-cover" /> : <span className="text-indigo-600 font-bold text-2xl">{(tutor.user?.name || 'T').charAt(0)}</span>}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{tutor.user?.name}</h3>
                                                <p className="text-sm text-gray-500">{tutor.professional_title || 'Tutor'}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(tutor.average_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}
                                                    <span className="text-xs text-gray-500 ml-1">{typeof tutor.average_rating === 'number' ? tutor.average_rating.toFixed(1) : '—'} ({tutor.total_sessions || 0})</span>
                                                </div>
                                            </div>
                                        </div>
                                        {tutor.specialties?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {tutor.specialties.slice(0, 3).map((s) => <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s.name}</span>)}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            {tutor.years_experience > 0 && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{tutor.years_experience} años</span>}
                                            {tutor.user?.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tutor.user.city}</span>}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">{tutor.hourly_rate ? `${tutor.hourly_rate} tokens/h` : 'Consultar'}</span>
                                        <Link href={`/tutors/${tutor.id}`} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Ver perfil →</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
}

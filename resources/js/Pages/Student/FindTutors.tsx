import { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Search, Star, MapPin, Clock, GraduationCap, Award, Filter } from 'lucide-react';

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
    specialties?: Specialty[];
}

export default function StudentFindTutors({ tutors: rawTutors, specialties: rawSpecialties }: PageProps) {
    const tutors = Array.isArray(rawTutors) ? rawTutors : (rawTutors?.data || []);
    const specialties = Array.isArray(rawSpecialties) ? rawSpecialties : [];
    const [search, setSearch] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);

    const filtered = tutors.filter((t) => {
        const matchesSearch = !search || t.user?.name?.toLowerCase().includes(search.toLowerCase()) || t.professional_title?.toLowerCase().includes(search.toLowerCase());
        const matchesSpecialty = !selectedSpecialty || t.specialties?.some((s) => s.id === selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Search className="h-7 w-7 text-indigo-500" /> Buscar Tutores</h1>
                    <p className="text-gray-500 mt-1">Encuentra el tutor ideal para tus necesidades</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o especialidad..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <button onClick={() => setSelectedSpecialty(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!selectedSpecialty ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        {specialties.map((s) => (
                            <button key={s.id} onClick={() => setSelectedSpecialty(s.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSpecialty === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.name}</button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin resultados</h3>
                        <p className="text-gray-500">No se encontraron tutores con esos filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((tutor) => (
                            <div key={tutor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {tutor.user?.avatar ? <img src={tutor.user.avatar} alt={tutor.user.name} className="h-full w-full object-cover" /> : <span className="text-indigo-600 font-bold text-xl">{(tutor.user?.name || 'T').charAt(0)}</span>}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{tutor.user?.name}</h3>
                                            <p className="text-sm text-gray-500">{tutor.professional_title || 'Tutor'}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(tutor.average_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}
                                                <span className="text-xs text-gray-500 ml-1">{(tutor.average_rating || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {tutor.specialties?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {tutor.specialties.slice(0, 3).map((s) => <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s.name}</span>)}
                                            {tutor.specialties.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{tutor.specialties.length - 3}</span>}
                                        </div>
                                    )}
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
        </DashboardLayout>
    );
}

import { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Users,
    Search,
    Calendar,
    Star,
    ChevronRight,
    GraduationCap,
    Clock,
} from 'lucide-react';
interface Student {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    total_sessions?: number;
}

interface PageProps {
    students: Student[];
}

export default function TutorStudents({ students: rawStudents }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };

    const students = Array.isArray(rawStudents) ? rawStudents : [];

    const [search, setSearch] = useState('');

    const filtered = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-7 w-7 text-indigo-500" />
                            Mis Estudiantes
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {students.length} estudiante{students.length !== 1 ? 's' : ''} registrado{students.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar estudiante por nombre o email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Students List */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {search ? 'Sin resultados' : 'Sin estudiantes aún'}
                        </h3>
                        <p className="text-gray-500">
                            {search
                                ? `No se encontraron estudiantes para "${search}"`
                                : 'Cuando completes sesiones de tutoría, tus estudiantes aparecerán aquí.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((student) => {
                            return (
                                <div
                                    key={student.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {student.avatar ? (
                                                    <img
                                                        src={student.avatar}
                                                        alt={student.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-indigo-600 font-bold text-lg">
                                                        {student.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {student.name}
                                                </h3>
                                                {student.email && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {student.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {student.total_sessions || 0} sesión{(student.total_sessions || 0) !== 1 ? 'es' : ''}
                                        </div>
                                        <Link
                                            href={`/tutor/students/${student.id}`}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                        >
                                            Ver perfil
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

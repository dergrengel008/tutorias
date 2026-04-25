import { usePage, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    User,
    Mail,
    Calendar,
    Star,
    Clock,
    ArrowLeft,
    MessageSquare,
} from 'lucide-react';
import type { TutoringSession } from '@/types';

interface StudentData {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    city?: string;
    country?: string;
}

interface PageProps {
    student: StudentData;
    sessions?: TutoringSession[];
}

export default function TutorStudentShow({ student: rawStudent, sessions: rawSessions }: PageProps) {
    const student = rawStudent || ({} as any);
    const sessions = Array.isArray(rawSessions) ? rawSessions : [];

    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            scheduled: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            scheduled: 'Programada',
            in_progress: 'En Progreso',
            completed: 'Completada',
            cancelled: 'Cancelada',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Back button */}
                <Link
                    href="/tutor/students"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Mis Estudiantes
                </Link>

                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 font-bold text-3xl">{(student.name || '?').charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{student.name || 'Estudiante'}</h1>
                            {student.email && (
                                <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                                    <Mail className="h-4 w-4" /> {student.email}
                                </p>
                            )}
                            {(student.city || student.country) && (
                                <p className="text-gray-400 text-sm mt-1">
                                    {[student.city, student.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {student.bio && (
                        <p className="mt-4 text-gray-600 leading-relaxed">{student.bio}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-5 text-center">
                        <Calendar className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{completedSessions.length}</p>
                        <p className="text-sm text-gray-500">Sesiones Completadas</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5 text-center">
                        <Clock className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
                        <p className="text-sm text-gray-500">Minutos Totales</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5 text-center">
                        <MessageSquare className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                        <p className="text-sm text-gray-500">Total Sesiones</p>
                    </div>
                </div>

                {/* Sessions History */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        Historial de Sesiones
                    </h2>
                    {sessions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No hay sesiones registradas con este estudiante.</p>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{session.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {session.scheduled_at ? formatDate(session.scheduled_at) : '—'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {statusBadge(session.status)}
                                        {session.duration_minutes > 0 && (
                                            <p className="text-xs text-gray-400 mt-1">{session.duration_minutes} min</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

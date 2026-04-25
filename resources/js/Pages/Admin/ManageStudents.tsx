import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    CreditCard,
    GraduationCap,
} from 'lucide-react';
import type { User as UserType } from '@/types';

interface PageProps {
    students: (UserType & { student_profile?: { total_sessions_completed: number; education_level?: string; institution?: string }; token_balance?: number })[];
}

export default function ManageStudents({ students: initialStudents }: PageProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const students = Array.isArray(props.students)
        ? (props.students as PageProps['students'])
        : ((props.students?.data || initialStudents || []) as PageProps['students']);

    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = searchTerm
        ? students.filter(
              (s) =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : students;

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="h-7 w-7 text-indigo-500" />
                        Gestionar Estudiantes
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {students.length} estudiante{students.length !== 1 ? 's' : ''} registrado
                        {students.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Búsqueda</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Estudiante
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                                        Email
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                                        Sesiones
                                    </th>
                                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Tokens
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Estado
                                    </th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
                                        Registro
                                    </th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400">
                                            No se encontraron estudiantes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                                                        {student.avatar ? (
                                                            <img
                                                                src={student.avatar}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-emerald-600 font-bold">
                                                                {student.name.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-xs text-gray-400 md:hidden truncate">
                                                            {student.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">
                                                {student.email}
                                            </td>
                                            <td className="py-3 px-4 text-center hidden sm:table-cell">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {student.student_profile?.total_sessions_completed || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                                                <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    {student.token_balance || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        student.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {student.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500 hidden lg:table-cell">
                                                {student.created_at ? formatDate(student.created_at) : '—'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => router.get(`/admin/students/${student.id}`)}
                                                        className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                                                       
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    {!student.is_active && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('¿Activar este estudiante?')) {
                                                                    router.post(`/admin/students/${student.id}/activate`);
                                                                }
                                                            }}
                                                            className="h-8 w-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-600 transition-colors"
                                                           
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {student.is_active && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('¿Desactivar este estudiante?')) {
                                                                    router.post(`/admin/students/${student.id}/deactivate`);
                                                                }
                                                            }}
                                                            className="h-8 w-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors"
                                                           
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

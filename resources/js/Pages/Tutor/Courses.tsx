import { usePage, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { BookOpen, Plus, Edit, Trash2, GraduationCap } from 'lucide-react';

interface TutorCourse {
    id: number;
    title: string;
    description?: string;
    institution?: string;
    year?: number;
}

interface PageProps {
    courses?: TutorCourse[] | null;
}

export default function TutorCourses({ courses: rawCourses }: PageProps) {
    const courses = Array.isArray(rawCourses) ? rawCourses : [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-indigo-500" />
                            Mis Cursos y Documentos
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {courses.length} curso{courses.length !== 1 ? 's' : ''} registrado{courses.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href="/tutor/courses"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Curso
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin cursos aún</h3>
                        <p className="text-gray-500">Agrega tus cursos, certificaciones y documentos profesionales.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                                            {course.description && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                {course.institution && <span>{course.institution}</span>}
                                                {course.year && <span>{course.year}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

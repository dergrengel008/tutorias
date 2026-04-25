import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { MessageSquare, Star, User, Filter, Search } from 'lucide-react';
import { useState } from 'react';

interface ReviewData {
    id: number;
    rating: number;
    comment?: string;
    is_anonymous?: boolean;
    reviewer?: { name: string; email?: string };
    tutor_profile?: { user?: { name: string } };
    session?: { title?: string };
    created_at: string;
}

interface PageProps {
    reviews?: ReviewData[];
}

export default function AdminReviews({ reviews: rawReviews }: PageProps) {
    const reviews = Array.isArray(rawReviews) ? rawReviews : (rawReviews && typeof rawReviews === 'object' && 'data' in rawReviews ? (rawReviews as any).data : []);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const filtered = reviews.filter((r) => {
        const matchesSearch = !search || r.reviewer?.name?.toLowerCase().includes(search.toLowerCase()) || r.tutor_profile?.user?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesRating = !ratingFilter || r.rating === ratingFilter;
        return matchesSearch && matchesRating;
    });

    const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="h-7 w-7 text-indigo-500" /> Reseñas</h1>
                        <p className="text-gray-500 mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · Promedio: {avgRating.toFixed(1)} ⭐</p>
                    </div>
                </div>

                {/* ═══ Separator ═══ */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filtros</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <button onClick={() => setRatingFilter(null)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${!ratingFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <button key={r} onClick={() => setRatingFilter(r)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${ratingFilter === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {r}⭐
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin reseñas</h3>
                        <p className="text-gray-500">No se encontraron reseñas.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-lg p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><User className="h-5 w-5 text-indigo-600" /></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{review.is_anonymous ? 'Estudiante Anónimo' : review.reviewer?.name || 'Estudiante'}</p>
                                            {review.tutor_profile?.user?.name && <p className="text-xs text-gray-400">Para: {review.tutor_profile.user.name}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(review.created_at)}</p>
                                    </div>
                                </div>
                                {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

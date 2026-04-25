import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Star, MessageSquare, User, Filter } from 'lucide-react';
import { useState } from 'react';

interface ReviewData {
    id: number;
    rating: number;
    comment?: string;
    is_anonymous?: boolean;
    reviewer?: { name: string };
    tutor_profile?: { user?: { name: string } };
    created_at: string;
}

interface PageProps {
    reviews?: ReviewData[];
}

export default function ReviewsIndex({ reviews: rawReviews }: PageProps) {
    const reviews = Array.isArray(rawReviews) ? rawReviews : [];
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const filtered = ratingFilter ? reviews.filter((r) => r.rating === ratingFilter) : reviews;
    const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><MessageSquare className="h-7 w-7 text-indigo-500" /> Reseñas</h1>
                    <p className="text-gray-500 mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · Promedio: {avgRating.toFixed(1)} ⭐</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <button onClick={() => setRatingFilter(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!ratingFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        {[5, 4, 3, 2, 1].map((r) => (
                            <button key={r} onClick={() => setRatingFilter(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${ratingFilter === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {r} <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin reseñas</h3>
                        <p className="text-gray-500">No hay reseñas para mostrar.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><User className="h-5 w-5 text-indigo-600" /></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{review.is_anonymous ? 'Estudiante Anónimo' : review.reviewer?.name || 'Estudiante'}</p>
                                            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
                                </div>
                                {review.comment && <p className="text-gray-600 leading-relaxed">{review.comment}</p>}
                                {review.tutor_profile?.user?.name && <p className="text-xs text-gray-400 mt-2">Para: {review.tutor_profile.user.name}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

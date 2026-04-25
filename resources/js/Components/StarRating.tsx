import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

const sizeClasses: Record<string, string> = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4.5 w-4.5',
    lg: 'h-5.5 w-5.5',
};

const textSizeClasses: Record<string, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};

export default function StarRating({
    rating,
    maxStars = 5,
    size = 'md',
    showValue = true,
}: StarRatingProps) {
    const stars = [];
    const clampedRating = Math.max(0, Math.min(rating, maxStars));

    for (let i = 1; i <= maxStars; i++) {
        const diff = clampedRating - i + 1;

        if (diff >= 1) {
            // Full star
            stars.push(
                <Star
                    key={i}
                    className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
                />
            );
        } else if (diff >= 0.25) {
            // Half star
            stars.push(
                <StarHalf
                    key={i}
                    className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
                />
            );
        } else {
            // Empty star
            stars.push(
                <Star
                    key={i}
                    className={`${sizeClasses[size]} fill-none text-gray-300`}
                />
            );
        }
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">{stars}</div>
            {showValue && (
                <span className={`font-medium text-gray-600 ${textSizeClasses[size]}`}>
                    {clampedRating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

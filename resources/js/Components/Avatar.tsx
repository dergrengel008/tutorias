interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<string, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};

const gradientClasses = [
    'bg-gradient-to-br from-indigo-400 to-purple-500',
    'bg-gradient-to-br from-emerald-400 to-teal-500',
    'bg-gradient-to-br from-rose-400 to-pink-500',
    'bg-gradient-to-br from-amber-400 to-orange-500',
    'bg-gradient-to-br from-sky-400 to-blue-500',
    'bg-gradient-to-br from-violet-400 to-indigo-500',
];

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getGradientForName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradientClasses[Math.abs(hash) % gradientClasses.length];
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
    const initials = getInitials(name);
    const gradient = getGradientForName(name);

    if (src) {
        return (
            <div
                className={`relative flex-shrink-0 overflow-hidden rounded-full ${sizeClasses[size]}`}
            >
                <img
                    src={src}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizeClasses[size]} ${gradient}`}
            title={name}
        >
            {initials}
        </div>
    );
}

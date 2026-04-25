import { PageProps as InertiaPageProps } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'tutor' | 'student';
    avatar?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
    latitude?: number;
    longitude?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    tutor_profile?: TutorProfile;
    student_profile?: StudentProfile;
    token_balance?: number;
}

interface TutorProfile {
    id: number;
    user_id: number;
    professional_title?: string;
    education_level?: string;
    years_experience: number;
    hourly_rate?: number;
    id_card_image?: string;
    title_document?: string;
    selfie_image?: string;
    is_approved: boolean;
    approval_date?: string;
    rejection_reason?: string;
    average_rating: number;
    total_sessions: number;
    total_warnings: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    created_at?: string;
    updated_at?: string;
    user?: User;
    specialties?: Specialty[];
    reviews?: Review[];
}

interface StudentProfile {
    id: number;
    education_level?: string;
    institution?: string;
    id_card_image?: string;
    selfie_image?: string;
    total_sessions_completed: number;
    created_at?: string;
    updated_at?: string;
}

interface Specialty {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    created_at?: string;
    updated_at?: string;
}

interface TutorCourse {
    id: number;
    tutor_profile_id: number;
    title: string;
    description?: string;
    file_path: string;
    institution?: string;
    year?: number;
    created_at?: string;
}

interface TutoringSession {
    id: number;
    tutor_profile_id: number;
    student_user_id: number;
    title: string;
    description?: string;
    scheduled_at?: string;
    started_at?: string;
    ended_at?: string;
    duration_minutes: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    tokens_cost: number;
    tutor_earned_tokens: number;
    whiteboard_data?: Record<string, unknown>;
    meeting_link?: string;
    created_at?: string;
    updated_at?: string;
    tutor_profile?: TutorProfile;
    student?: User;
    review?: Review;
}

interface TokenTransaction {
    id: number;
    quantity: number;
    transaction_type: string;
    amount?: number;
    tokens_before: number;
    tokens_after: number;
    description?: string;
    reference?: string;
    created_at: string;
}

interface Review {
    id: number;
    tutoring_session_id: number;
    reviewer_user_id: number;
    tutor_profile_id: number;
    rating: number;
    comment?: string;
    type: 'review' | 'warning';
    is_anonymous: boolean;
    created_at: string;
    updated_at?: string;
    reviewer?: User;
    tutor_profile?: TutorProfile;
    session?: TutoringSession;
}

interface AppNotification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    data?: Record<string, unknown>;
    created_at: string;
    updated_at?: string;
}

interface AdminDashboardStats {
    total_users: number;
    total_tutors: number;
    total_students: number;
    pending_tutors: number;
    active_sessions: number;
    total_tokens_sold: number;
    total_revenue: number;
}

interface StudentDashboardStats {
    upcoming_sessions: number;
    completed_sessions: number;
    token_balance: number;
    average_rating_given: number;
}

interface TutorDashboardStats {
    upcoming_sessions: number;
    completed_sessions: number;
    average_rating: number;
    total_earnings: number;
    total_students: number;
    profile_status: string;
}

declare module '@inertiajs/react' {
    interface PageProps {
        auth: {
            user: User | null;
            role: string | null;
        };
        flash: {
            success?: string;
            error?: string;
        };
    }
}

export type { User, TutorProfile, StudentProfile, Specialty, TutorCourse, TutoringSession, TokenTransaction, Review, AppNotification, AdminDashboardStats, StudentDashboardStats, TutorDashboardStats };
export { AppNotification as Notification };

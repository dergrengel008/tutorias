<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use App\Models\TutorCourse;
use App\Models\TutoringSession;
use App\Models\Review;
use App\Models\Token;
use Carbon\Carbon;

class TutoriaDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates test data for the TutoriaApp platform:
     * - 3 approved tutors (with TutorProfile, specialties, courses)
     * - 5 students (with StudentProfile)
     * - 3 tutoring sessions (completed, in_progress, scheduled)
     * - 10 reviews across tutors
     * - Initial token balances for all users
     */
    public function run(): void
    {
        // ─── Get specialties ────────────────────────────────────────
        $math     = Specialty::where('name', 'Matemáticas')->first();
        $physics  = Specialty::where('name', 'Física')->first();
        $prog     = Specialty::where('name', 'Programación')->first();
        $english  = Specialty::where('name', 'Inglés')->first();
        $chem     = Specialty::where('name', 'Química')->first();

        if (! $math || ! $physics || ! $prog) {
            $this->command->warn('Las especialidades base no existen. Ejecuta SpecialtySeeder primero.');
            return;
        }

        // ─── Create Tutors ──────────────────────────────────────────
        $tutors = [
            [
                'name'  => 'Carlos Andrés Rodríguez',
                'email' => 'carlos.rodriguez@tutoria.com',
                'phone' => '+58 412-1234567',
                'city'  => 'Caracas',
                'country' => 'Venezuela',
                'bio' => 'Profesor universitario de matemáticas con más de 8 años de experiencia. Especialista en cálculo y álgebra lineal.',
                'professional_title' => 'Licenciado en Matemáticas',
                'education_level' => 'Universitario',
                'years_experience' => 8,
                'hourly_rate' => 25.00,
            ],
            [
                'name'  => 'María Gabriela Fernández',
                'email' => 'maria.fernandez@tutoria.com',
                'phone' => '+58 414-7654321',
                'city'  => 'Maracaibo',
                'country' => 'Venezuela',
                'bio' => 'Ingeniera de sistemas con maestría en física computacional. Apasionada por la enseñanza de programación y física.',
                'professional_title' => 'Ingeniera de Sistemas, M.Sc.',
                'education_level' => 'Postgrado',
                'years_experience' => 6,
                'hourly_rate' => 30.00,
            ],
            [
                'name'  => 'José Manuel Hernández',
                'email' => 'jose.hernandez@tutoria.com',
                'phone' => '+58 416-9876543',
                'city'  => 'Valencia',
                'country' => 'Venezuela',
                'bio' => 'Docente bilingüe certificado con experiencia en preparación de exámenes internacionales de inglés (TOEFL, IELTS).',
                'professional_title' => 'Profesor de Inglés',
                'education_level' => 'Universitario',
                'years_experience' => 10,
                'hourly_rate' => 20.00,
            ],
        ];

        $tutorUsers = [];
        $tutorProfiles = [];

        foreach ($tutors as $tutorData) {
            $user = User::firstOrCreate(
                ['email' => $tutorData['email']],
                [
                    'name'     => $tutorData['name'],
                    'email'    => $tutorData['email'],
                    'password' => Hash::make('password'),
                    'role'     => 'tutor',
                    'phone'    => $tutorData['phone'],
                    'city'     => $tutorData['city'],
                    'country'  => $tutorData['country'],
                    'bio'      => $tutorData['bio'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            $profile = TutorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'user_id'          => $user->id,
                    'professional_title' => $tutorData['professional_title'],
                    'education_level'  => $tutorData['education_level'],
                    'years_experience' => $tutorData['years_experience'],
                    'hourly_rate'      => $tutorData['hourly_rate'],
                    'status'           => 'approved',
                    'is_approved'      => true,
                    'approval_date'    => now()->subDays(30),
                    'average_rating'   => 0,
                    'total_sessions'   => 0,
                    'total_warnings'   => 0,
                ]
            );

            $tutorUsers[] = $user;
            $tutorProfiles[] = $profile;
        }

        // ─── Assign specialties to tutors ──────────────────────────
        $tutorProfiles[0]->specialties()->syncWithoutDetaching([$math->id, $physics->id]);
        $tutorProfiles[1]->specialties()->syncWithoutDetaching([$prog->id, $physics->id]);
        $tutorProfiles[2]->specialties()->syncWithoutDetaching([$english->id, $chem->id]);

        // ─── Create courses for tutors ─────────────────────────────
        TutorCourse::firstOrCreate(
            ['tutor_profile_id' => $tutorProfiles[0]->id, 'title' => 'Cálculo Diferencial e Integral'],
            [
                'description' => 'Curso completo de cálculo diferencial e integral con ejercicios prácticos y ejemplos venezolanos.',
                'institution' => 'Universidad Central de Venezuela',
                'year' => 2024,
            ]
        );

        TutorCourse::firstOrCreate(
            ['tutor_profile_id' => $tutorProfiles[1]->id, 'title' => 'Programación en Python desde Cero'],
            [
                'description' => 'Aprende Python desde los fundamentos hasta conceptos avanzados. Incluye proyectos prácticos.',
                'institution' => 'Universidad del Zulia',
                'year' => 2024,
            ]
        );

        TutorCourse::firstOrCreate(
            ['tutor_profile_id' => $tutorProfiles[2]->id, 'title' => 'Inglés Conversacional B1-B2'],
            [
                'description' => 'Desarrolla tu fluidez en inglés conversacional con temas del día a día y preparación TOEFL.',
                'institution' => 'Universidad de Carabobo',
                'year' => 2024,
            ]
        );

        // ─── Create Students ────────────────────────────────────────
        $students = [
            [
                'name'  => 'Ana Sofía Martínez',
                'email' => 'ana.martinez@tutoria.com',
                'phone' => '+58 412-5551234',
                'city'  => 'Caracas',
                'country' => 'Venezuela',
                'education_level' => 'Universitario',
                'institution' => 'Universidad Central de Venezuela',
            ],
            [
                'name'  => 'Pedro Luis García',
                'email' => 'pedro.garcia@tutoria.com',
                'phone' => '+58 414-5555678',
                'city'  => 'Maracaibo',
                'country' => 'Venezuela',
                'education_level' => 'Bachiller',
                'institution' => null,
            ],
            [
                'name'  => 'Valentina Rodríguez',
                'email' => 'valentina.rodriguez@tutoria.com',
                'phone' => '+58 416-5559012',
                'city'  => 'Valencia',
                'country' => 'Venezuela',
                'education_level' => 'Universitario',
                'institution' => 'Universidad de Carabobo',
            ],
            [
                'name'  => 'Diego Armando Torres',
                'email' => 'diego.torres@tutoria.com',
                'phone' => '+58 424-5553456',
                'city'  => 'Barquisimeto',
                'country' => 'Venezuela',
                'education_level' => 'Universitario',
                'institution' => 'Universidad Centroccidental Lisandro Alvarado',
            ],
            [
                'name'  => 'Isabella María López',
                'email' => 'isabella.lopez@tutoria.com',
                'phone' => '+58 412-5557890',
                'city'  => 'Caracas',
                'country' => 'Venezuela',
                'education_level' => 'Postgrado',
                'institution' => 'Universidad Simón Bolívar',
            ],
        ];

        $studentUsers = [];

        foreach ($students as $studentData) {
            $user = User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name'     => $studentData['name'],
                    'email'    => $studentData['email'],
                    'password' => Hash::make('password'),
                    'role'     => 'student',
                    'phone'    => $studentData['phone'],
                    'city'     => $studentData['city'],
                    'country'  => $studentData['country'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            StudentProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'user_id'                 => $user->id,
                    'education_level'         => $studentData['education_level'],
                    'institution'             => $studentData['institution'],
                    'total_sessions_completed' => 0,
                ]
            );

            $studentUsers[] = $user;
        }

        // ─── Create Tokens for all users ───────────────────────────
        foreach ($tutorUsers as $user) {
            Token::firstOrCreate(
                ['user_id' => $user->id, 'reference' => "initial_balance_tutor_{$user->id}"],
                [
                    'user_id'          => $user->id,
                    'quantity'         => 0,
                    'transaction_type' => 'admin_credit',
                    'amount'           => 0,
                    'tokens_before'    => 0,
                    'tokens_after'     => 0,
                    'description'      => 'Saldo inicial (tutor)',
                    'reference'        => "initial_balance_tutor_{$user->id}",
                ]
            );
        }

        foreach ($studentUsers as $user) {
            Token::firstOrCreate(
                ['user_id' => $user->id, 'reference' => "initial_balance_student_{$user->id}"],
                [
                    'user_id'          => $user->id,
                    'quantity'         => 50,
                    'transaction_type' => 'admin_credit',
                    'amount'           => 25.00,
                    'tokens_before'    => 0,
                    'tokens_after'     => 50,
                    'description'      => 'Saldo inicial de bienvenida - 50 tokens',
                    'reference'        => "initial_balance_student_{$user->id}",
                ]
            );
        }

        // ─── Create Tutoring Sessions ───────────────────────────────
        $sessions = [];

        // Session 1: Completed
        $sessions[] = TutoringSession::firstOrCreate(
            [
                'tutor_profile_id' => $tutorProfiles[0]->id,
                'student_user_id'  => $studentUsers[0]->id,
                'title'            => 'Repaso de Cálculo Diferencial',
            ],
            [
                'tutor_profile_id'   => $tutorProfiles[0]->id,
                'student_user_id'    => $studentUsers[0]->id,
                'title'              => 'Repaso de Cálculo Diferencial',
                'description'        => 'Repaso general de límites, derivadas y aplicaciones para el examen parcial.',
                'scheduled_at'       => Carbon::now()->subDays(5)->setHour(10)->setMinute(0),
                'started_at'         => Carbon::now()->subDays(5)->setHour(10)->setMinute(0),
                'ended_at'           => Carbon::now()->subDays(5)->setHour(11)->setMinute(30),
                'duration_minutes'   => 90,
                'status'             => 'completed',
                'tokens_cost'        => 5,
                'tutor_earned_tokens' => 4,
                'meeting_link'       => 'https://meet.jit.si/tutoria-session-1',
            ]
        );

        // Session 2: In progress
        $sessions[] = TutoringSession::firstOrCreate(
            [
                'tutor_profile_id' => $tutorProfiles[1]->id,
                'student_user_id'  => $studentUsers[1]->id,
                'title'            => 'Introducción a Python',
            ],
            [
                'tutor_profile_id'   => $tutorProfiles[1]->id,
                'student_user_id'    => $studentUsers[1]->id,
                'title'              => 'Introducción a Python',
                'description'        => 'Clase introductoria: variables, tipos de datos, estructuras de control básicas.',
                'scheduled_at'       => Carbon::now()->subMinutes(30),
                'started_at'         => Carbon::now()->subMinutes(30),
                'ended_at'           => null,
                'duration_minutes'   => 60,
                'status'             => 'in_progress',
                'tokens_cost'        => 8,
                'tutor_earned_tokens' => 7,
                'meeting_link'       => 'https://meet.jit.si/tutoria-session-2',
            ]
        );

        // Session 3: Scheduled
        $sessions[] = TutoringSession::firstOrCreate(
            [
                'tutor_profile_id' => $tutorProfiles[2]->id,
                'student_user_id'  => $studentUsers[2]->id,
                'title'            => 'Conversación en Inglés - Nivel B1',
            ],
            [
                'tutor_profile_id'   => $tutorProfiles[2]->id,
                'student_user_id'    => $studentUsers[2]->id,
                'title'              => 'Conversación en Inglés - Nivel B1',
                'description'        => 'Práctica de conversación cotidiana y preparación para situación de viaje.',
                'scheduled_at'       => Carbon::now()->addDays(2)->setHour(15)->setMinute(0),
                'started_at'         => null,
                'ended_at'           => null,
                'duration_minutes'   => 45,
                'status'             => 'scheduled',
                'tokens_cost'        => 6,
                'tutor_earned_tokens' => 5,
                'meeting_link'       => 'https://meet.jit.si/tutoria-session-3',
            ]
        );

        // ─── Update tutor stats ────────────────────────────────────
        $tutorProfiles[0]->increment('total_sessions');
        $studentProfiles0 = StudentProfile::where('user_id', $studentUsers[0]->id)->first();
        if ($studentProfiles0) {
            $studentProfiles0->increment('total_sessions_completed');
        }

        // ─── Create Reviews ────────────────────────────────────────
        $reviews = [
            // Reviews for tutor 1 (Carlos - Math)
            [
                'tutoring_session_id' => $sessions[0]->id,
                'reviewer_user_id'    => $studentUsers[0]->id,
                'tutor_profile_id'    => $tutorProfiles[0]->id,
                'rating'              => 5,
                'comment'             => 'Excelente tutor. Explica de forma muy clara y tiene mucha paciencia. Me ayudó a entender derivadas por fin.',
            ],
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[2]->id,
                'tutor_profile_id'    => $tutorProfiles[0]->id,
                'rating'              => 4,
                'comment'             => 'Muy buen profesor, muy preparado. A veces va un poco rápido pero siempre está dispuesto a repetir.',
            ],
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[3]->id,
                'tutor_profile_id'    => $tutorProfiles[0]->id,
                'rating'              => 5,
                'comment'             => 'La mejor clase de matemáticas que he tenido. Carlos tiene una forma única de hacer fácil lo difícil.',
            ],
            // Reviews for tutor 2 (María - Programming/Physics)
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[0]->id,
                'tutor_profile_id'    => $tutorProfiles[1]->id,
                'rating'              => 4,
                'comment'             => 'María es excelente explicando conceptos de programación. Sus ejemplos prácticos son muy útiles.',
            ],
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[3]->id,
                'tutor_profile_id'    => $tutorProfiles[1]->id,
                'rating'              => 5,
                'comment'             => 'Increíble dominio de Python y física. Me ayudó con mi proyecto de grado. 100% recomendada.',
            ],
            // Reviews for tutor 3 (José - English)
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[0]->id,
                'tutor_profile_id'    => $tutorProfiles[2]->id,
                'rating'              => 5,
                'comment'             => 'José hace las clases de inglés muy dinámicas y divertidas. En pocas semanas mejoré mucho mi pronunciación.',
            ],
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[1]->id,
                'tutor_profile_id'    => $tutorProfiles[2]->id,
                'rating'              => 4,
                'comment'             => 'Buen profesor de inglés. Muy profesional y siempre preparado para las clases.',
            ],
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[4]->id,
                'tutor_profile_id'    => $tutorProfiles[2]->id,
                'rating'              => 5,
                'comment'             => 'Me preparó para el TOEFL y obtuve una excelente puntuación. Profesor altamente recomendado.',
            ],
            // More reviews for tutor 1
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[4]->id,
                'tutor_profile_id'    => $tutorProfiles[0]->id,
                'rating'              => 4,
                'comment'             => 'Muy bueno enseñando álgebra lineal. Tiene mucha paciencia con los estudiantes que necesitas más ayuda.',
            ],
            // More reviews for tutor 2
            [
                'tutoring_session_id' => null,
                'reviewer_user_id'    => $studentUsers[2]->id,
                'tutor_profile_id'    => $tutorProfiles[1]->id,
                'rating'              => 5,
                'comment'             => 'María es una tutora excepcional. Sus clases de física computacional son increíblemente claras.',
            ],
        ];

        foreach ($reviews as $reviewData) {
            Review::firstOrCreate(
                [
                    'reviewer_user_id'    => $reviewData['reviewer_user_id'],
                    'tutor_profile_id'    => $reviewData['tutor_profile_id'],
                    'comment'             => $reviewData['comment'],
                ],
                [
                    'tutoring_session_id' => $reviewData['tutoring_session_id'],
                    'reviewer_user_id'    => $reviewData['reviewer_user_id'],
                    'tutor_profile_id'    => $reviewData['tutor_profile_id'],
                    'rating'              => $reviewData['rating'],
                    'comment'             => $reviewData['comment'],
                    'type'                => 'review',
                    'is_anonymous'        => false,
                ]
            );
        }

        // ─── Update average ratings ────────────────────────────────
        foreach ($tutorProfiles as $profile) {
            $avgRating = Review::where('tutor_profile_id', $profile->id)
                ->where('type', 'review')
                ->avg('rating');
            $profile->update([
                'average_rating' => $avgRating ? round($avgRating, 2) : 0,
            ]);
        }

        $this->command->info('Datos de prueba creados exitosamente:');
        $this->command->info("  - 3 tutores aprobados");
        $this->command->info("  - 5 estudiantes con 50 tokens cada uno");
        $this->command->info("  - 3 sesiones de tutoría (completada, en progreso, programada)");
        $this->command->info("  - 10 reseñas distribuidas entre tutores");
        $this->command->info("  Contraseña de todos los usuarios: password");
    }
}

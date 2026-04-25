<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\Specialty;
use App\Models\TutoringSession;
use App\Models\Review;
use App\Models\Token;
use App\Models\TokenPackage;
use App\Models\Notification;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Update specialty prices ─────────────────────────────
        $pricing = [
            'Matemáticas' => 12, 'Física' => 14, 'Química' => 12,
            'Biología' => 10, 'Programación' => 18, 'Inglés' => 10,
            'Francés' => 10, 'Historia' => 8, 'Geografía' => 8,
            'Filosofía' => 8, 'Economía' => 15, 'Contabilidad' => 14,
            'Derecho' => 16, 'Medicina' => 22, 'Ingeniería' => 16,
        ];
        foreach ($pricing as $name => $cost) {
            Specialty::where('name', $name)->update(['tokens_cost' => $cost, 'is_active' => true]);
        }

        // ─── Token Packages ──────────────────────────────────────
        $packages = [
            ['name' => 'Starter',   'tokens' => 50,   'bonus_tokens' => 0,   'price_usd' => 5.00,  'price_ves' => 185.00,  'is_popular' => false, 'is_active' => true, 'sort_order' => 1],
            ['name' => 'Básico',    'tokens' => 120,  'bonus_tokens' => 10,  'price_usd' => 10.00, 'price_ves' => 370.00,  'is_popular' => false, 'is_active' => true, 'sort_order' => 2],
            ['name' => 'Popular',   'tokens' => 250,  'bonus_tokens' => 30,  'price_usd' => 18.00, 'price_ves' => 666.00,  'is_popular' => true,  'is_active' => true, 'sort_order' => 3],
            ['name' => 'Avanzado',  'tokens' => 500,  'bonus_tokens' => 80,  'price_usd' => 30.00, 'price_ves' => 1110.00, 'is_popular' => false, 'is_active' => true, 'sort_order' => 4],
            ['name' => 'Premium',   'tokens' => 1000, 'bonus_tokens' => 200, 'price_usd' => 50.00, 'price_ves' => 1850.00, 'is_popular' => false, 'is_active' => true, 'sort_order' => 5],
        ];
        foreach ($packages as $pkg) {
            TokenPackage::create($pkg);
        }

        // ─── Tutors ──────────────────────────────────────────────
        $tutors = [
            [
                'name' => 'Prof. María García', 'email' => 'maria.garcia@demo.com',
                'professional_title' => 'Licenciada en Matemáticas', 'education_level' => 'maestria',
                'years_experience' => 8, 'city' => 'Caracas', 'country' => 'Venezuela',
                'bio' => 'Profesora universitaria con más de 8 años de experiencia en cálculo, álgebra lineal y estadística. Apasionada por hacer las matemáticas accesibles para todos los estudiantes.',
                'specialties' => ['Matemáticas', 'Física'],
                'avg_rating' => 4.9, 'sessions' => 142,
            ],
            [
                'name' => 'Ing. Carlos Rodríguez', 'email' => 'carlos.rodriguez@demo.com',
                'professional_title' => 'Ingeniero de Sistemas', 'education_level' => 'maestria',
                'years_experience' => 6, 'city' => 'Maracaibo', 'country' => 'Venezuela',
                'bio' => 'Desarrollador full-stack y tutor de programación. Especializado en JavaScript, Python, React y Node.js. He ayudado a más de 200 estudiantes a iniciar su carrera tech.',
                'specialties' => ['Programación', 'Ingeniería'],
                'avg_rating' => 4.8, 'sessions' => 98,
            ],
            [
                'name' => 'Dra. Ana Martínez', 'email' => 'ana.martinez@demo.com',
                'professional_title' => 'Doctora en Medicina', 'education_level' => 'doctorado',
                'years_experience' => 12, 'city' => 'Valencia', 'country' => 'Venezuela',
                'bio' => 'Médico cirujano con especialización en anatomía y fisiología. Tutora universitaria con enfoque en preparación para exámenes de residencia médica.',
                'specialties' => ['Medicina', 'Biología'],
                'avg_rating' => 4.9, 'sessions' => 87,
            ],
            [
                'name' => 'Lic. Pedro Hernández', 'email' => 'pedro.hernandez@demo.com',
                'professional_title' => 'Abogado', 'education_level' => 'licenciatura',
                'years_experience' => 5, 'city' => 'Barquisimeto', 'country' => 'Venezuela',
                'bio' => 'Abogado especialista en derecho civil y penal. Explico conceptos jurídicos complejos de forma sencilla y práctica para estudiantes de derecho.',
                'specialties' => ['Derecho', 'Filosofía'],
                'avg_rating' => 4.7, 'sessions' => 63,
            ],
            [
                'name' => 'Prof. Laura López', 'email' => 'laura.lopez@demo.com',
                'professional_title' => 'Profesora de Inglés', 'education_level' => 'licenciatura',
                'years_experience' => 7, 'city' => 'Caracas', 'country' => 'Venezuela',
                'bio' => 'Certificada TEFL con 7 años enseñando inglés como segundo idioma. Preparación para TOEFL, IELTS y exámenes de certificación internacional.',
                'specialties' => ['Inglés', 'Francés'],
                'avg_rating' => 4.8, 'sessions' => 156,
            ],
            [
                'name' => 'Ing. José Pérez', 'email' => 'jose.perez@demo.com',
                'professional_title' => 'Ingeniero Electrónico', 'education_level' => 'ingenieria',
                'years_experience' => 4, 'city' => 'Mérida', 'country' => 'Venezuela',
                'bio' => 'Ingeniero electrónico apasionado por la física y la electrónica. Explico circuitos, electromagnetismo y termodinámica con ejemplos prácticos.',
                'specialties' => ['Física', 'Ingeniería'],
                'avg_rating' => 4.6, 'sessions' => 45,
            ],
            [
                'name' => 'Lic. Sofía Ramírez', 'email' => 'sofia.ramirez@demo.com',
                'professional_title' => 'Economista', 'education_level' => 'maestria',
                'years_experience' => 5, 'city' => 'Maracaibo', 'country' => 'Venezuela',
                'bio' => 'Economista con maestría en finanzas. Experta en microeconomía, macroeconomía y econometría. Ayudo a estudiantes a entender los mercados con casos reales.',
                'specialties' => ['Economía', 'Contabilidad'],
                'avg_rating' => 4.7, 'sessions' => 72,
            ],
            [
                'name' => 'Prof. Miguel Torres', 'email' => 'miguel.torres@demo.com',
                'professional_title' => 'Químico', 'education_level' => 'doctorado',
                'years_experience' => 9, 'city' => 'Caracas', 'country' => 'Venezuela',
                'bio' => 'Doctor en química con experiencia en investigación y docencia universitaria. Especialista en química orgánica y bioquímica.',
                'specialties' => ['Química', 'Biología'],
                'avg_rating' => 4.5, 'sessions' => 54,
            ],
        ];

        $tutorProfiles = [];
        foreach ($tutors as $i => $t) {
            $user = User::firstOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('password'),
                    'role' => 'tutor',
                    'is_active' => true,
                    'city' => $t['city'],
                    'country' => $t['country'],
                    'bio' => $t['bio'],
                    'email_verified_at' => now(),
                ]
            );

            $profile = TutorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'professional_title' => $t['professional_title'],
                    'education_level' => $t['education_level'],
                    'years_experience' => $t['years_experience'],
                    'average_rating' => $t['avg_rating'],
                    'total_sessions' => $t['sessions'],
                    'status' => 'approved',
                    'is_approved' => true,
                    'approval_date' => now()->subMonths(rand(1, 6)),
                ]
            );

            $specialtyIds = Specialty::whereIn('name', $t['specialties'])->pluck('id')->toArray();
            $profile->specialties()->sync($specialtyIds);

            $tutorProfiles[] = $profile;
        }

        // ─── 2 Pending Tutors ────────────────────────────────────
        foreach ([
            ['name' => 'Prof. Roberto Díaz', 'email' => 'roberto.diaz@demo.com', 'professional_title' => 'Historiador', 'specialties' => ['Historia']],
            ['name' => 'Lic. Gabriela Flores', 'email' => 'gabriela.flores@demo.com', 'professional_title' => 'Geógrafa', 'specialties' => ['Geografía']],
        ] as $pt) {
            $user = User::firstOrCreate(['email' => $pt['email']], [
                'name' => $pt['name'], 'password' => Hash::make('password'),
                'role' => 'tutor', 'is_active' => true, 'email_verified_at' => now(),
            ]);
            $profile = TutorProfile::firstOrCreate(['user_id' => $user->id], [
                'professional_title' => $pt['professional_title'],
                'education_level' => 'licenciatura', 'years_experience' => 2,
                'status' => 'pending',
            ]);
            $profile->specialties()->sync(Specialty::whereIn('name', $pt['specialties'])->pluck('id')->toArray());
        }

        // ─── Students ────────────────────────────────────────────
        $students = [
            ['name' => 'Estudiante Demo', 'email' => 'estudiante@demo.com', 'city' => 'Caracas', 'tokens' => 500],
            ['name' => 'Luis Gómez', 'email' => 'luis.gomez@demo.com', 'city' => 'Valencia', 'tokens' => 200],
            ['name' => 'Camila Sánchez', 'email' => 'camila.sanchez@demo.com', 'city' => 'Maracaibo', 'tokens' => 350],
            ['name' => 'Diego Fernández', 'email' => 'diego.fernandez@demo.com', 'city' => 'Barquisimeto', 'tokens' => 150],
            ['name' => 'Valentina Rojas', 'email' => 'valentina.rojas@demo.com', 'city' => 'Mérida', 'tokens' => 280],
            ['name' => 'Andrés Morales', 'email' => 'andres.morales@demo.com', 'city' => 'Caracas', 'tokens' => 100],
            ['name' => 'Isabella Torres', 'email' => 'isabella.torres@demo.com', 'city' => 'Maracaibo', 'tokens' => 420],
            ['name' => 'Santiago Jiménez', 'email' => 'santiago.jimenez@demo.com', 'city' => 'Valencia', 'tokens' => 180],
            ['name' => 'Mariana Castro', 'email' => 'mariana.castro@demo.com', 'city' => 'Caracas', 'tokens' => 90],
            ['name' => 'José Manuel Rivas', 'email' => 'jose.rivas@demo.com', 'city' => 'Barquisimeto', 'tokens' => 310],
        ];

        $studentUsers = [];
        foreach ($students as $s) {
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'is_active' => true,
                    'city' => $s['city'],
                    'country' => 'Venezuela',
                    'email_verified_at' => now(),
                ]
            );
            StudentProfile::firstOrCreate(
                ['user_id' => $user->id],
                ['total_sessions_completed' => rand(0, 15)]
            );

            // Give tokens
            if ($s['tokens'] > 0) {
                $lastToken = Token::where('user_id', $user->id)->latest()->first();
                $before = $lastToken ? $lastToken->tokens_after : 0;
                Token::create([
                    'user_id' => $user->id,
                    'quantity' => $s['tokens'],
                    'transaction_type' => 'purchase',
                    'amount' => $s['tokens'] * 0.1,
                    'tokens_before' => $before,
                    'tokens_after' => $before + $s['tokens'],
                    'description' => 'Compra inicial de paquete de tokens',
                    'reference' => 'seed_purchase_' . $user->id,
                ]);
            }

            $studentUsers[] = $user;
        }

        // ─── Completed Sessions + Reviews ────────────────────────
        $reviewComments = [
            'Excelente tutor, explica de forma muy clara y paciente.',
            'Me ayudó a entender conceptos que no podía en la universidad.',
            'Muy profesional y puntual. La sesión fue muy productiva.',
            'La mejor tutoría que he tenido. Altamente recomendado.',
            'Metodología excelente, adapta el ritmo al estudiante.',
            'Súper amable y explica con ejemplos prácticos.',
            'Noté mucha mejora después de las sesiones con este tutor.',
            'Clase dinámica e interactiva. Se nota la experiencia.',
            'Perfecto para preparación de exámenes.',
            'Lo recomiendo 100%, resolvió todas mis dudas.',
        ];

        $sessionTitles = [
            'Tutoría de Cálculo Diferencial',
            'Ayuda con Álgebra Lineal',
            'Preparación para examen parcial de Física',
            'Introducción a Python',
            'Repaso de React Hooks',
            'Sesión de conversación en Inglés',
            'Anatomía del sistema nervioso',
            'Derecho Constitucional - Repaso',
            'Microeconomía: Oferta y Demanda',
            'Química Orgánica: Nomenclatura',
            'Cálculo Integral - Métodos de Integración',
            'Programación: Estructuras de Datos',
            'Preparación TOEFL Speaking',
            'Termodinámica: Primer Principio',
            'Electromagnetismo - Ley de Coulomb',
        ];

        $createdSessions = 0;
        foreach ($tutorProfiles as $tutorIdx => $tutorProfile) {
            $numSessions = rand(3, 8);
            for ($i = 0; $i < $numSessions; $i++) {
                $student = $studentUsers[array_rand($studentUsers)];
                $specialty = $tutorProfile->specialties->random();
                $tokensCost = $specialty->tokens_cost ?? 10;
                $commissionRate = 0.8;
                $tutorEarned = (int) ceil($tokensCost * $commissionRate);

                $scheduledAt = now()->subDays(rand(1, 30))->setHour(rand(8, 20))->setMinute(0)->setSecond(0);
                $duration = [30, 60, 60, 90, 120][array_rand([30, 60, 60, 90, 120])];

                $session = TutoringSession::create([
                    'tutor_profile_id' => $tutorProfile->id,
                    'student_user_id' => $student->id,
                    'specialty_id' => $specialty->id,
                    'title' => $sessionTitles[array_rand($sessionTitles)],
                    'description' => 'Sesión de tutoría personalizada.',
                    'scheduled_at' => $scheduledAt,
                    'started_at' => $scheduledAt->copy()->addMinutes(5),
                    'ended_at' => $scheduledAt->copy()->addMinutes($duration + 5),
                    'duration_minutes' => $duration,
                    'status' => 'completed',
                    'tokens_cost' => $tokensCost,
                    'tutor_earned_tokens' => $tutorEarned,
                    'meeting_link' => 'https://meet.jit.si/tutoria-' . uniqid(),
                ]);

                // Token transactions
                $studentBefore = Token::where('user_id', $student->id)->latest()->first()?->tokens_after ?? 0;
                Token::create([
                    'user_id' => $student->id, 'quantity' => $tokensCost,
                    'transaction_type' => 'session_payment', 'amount' => 0,
                    'tokens_before' => $studentBefore, 'tokens_after' => $studentBefore - $tokensCost,
                    'description' => "Reserva: {$session->title}", 'reference' => "session_{$session->id}",
                ]);

                $tutorBefore = Token::where('user_id', $tutorProfile->user_id)->latest()->first()?->tokens_after ?? 0;
                Token::create([
                    'user_id' => $tutorProfile->user_id, 'quantity' => $tutorEarned,
                    'transaction_type' => 'session_payment', 'amount' => 0,
                    'tokens_before' => $tutorBefore, 'tokens_after' => $tutorBefore + $tutorEarned,
                    'description' => "Pago sesión: {$session->title}", 'reference' => "session_{$session->id}",
                ]);

                // Review (70% chance)
                if (rand(1, 10) <= 7) {
                    $rating = rand(4, 5);
                    Review::create([
                        'tutoring_session_id' => $session->id,
                        'reviewer_user_id' => $student->id,
                        'tutor_profile_id' => $tutorProfile->id,
                        'rating' => $rating,
                        'comment' => $reviewComments[array_rand($reviewComments)],
                        'type' => 'review',
                        'is_anonymous' => rand(0, 1) === 1,
                    ]);
                }

                $createdSessions++;
            }
        }

        // ─── Scheduled (future) sessions ─────────────────────────
        for ($i = 0; $i < 5; $i++) {
            $tutor = $tutorProfiles[array_rand($tutorProfiles)];
            $student = $studentUsers[array_rand($studentUsers)];
            $specialty = $tutor->specialties->random();
            $tokensCost = $specialty->tokens_cost ?? 10;

            TutoringSession::create([
                'tutor_profile_id' => $tutor->id,
                'student_user_id' => $student->id,
                'specialty_id' => $specialty->id,
                'title' => $sessionTitles[array_rand($sessionTitles)],
                'description' => 'Próxima sesión programada.',
                'scheduled_at' => now()->addDays(rand(1, 7))->setHour(rand(9, 18))->setMinute(0)->setSecond(0),
                'duration_minutes' => 60,
                'status' => 'scheduled',
                'tokens_cost' => $tokensCost,
                'tutor_earned_tokens' => (int) ceil($tokensCost * 0.8),
                'meeting_link' => 'https://meet.jit.si/tutoria-' . uniqid(),
            ]);
        }

        // ─── Notifications ───────────────────────────────────────
        Notification::create([
            'user_id' => $tutorProfiles[0]->user_id,
            'title' => 'Nueva sesión reservada',
            'message' => 'Estudiante Demo ha reservado una sesión: Tutoría de Cálculo Diferencial',
            'type' => 'session_booked',
            'is_read' => false,
        ]);
        Notification::create([
            'user_id' => $tutorProfiles[0]->user_id,
            'title' => 'Nueva reseña recibida',
            'message' => 'Recibiste una reseña de 5 estrellas de un estudiante.',
            'type' => 'review',
            'is_read' => false,
        ]);
        Notification::create([
            'user_id' => $studentUsers[0]->id,
            'title' => 'Sesión completada',
            'message' => 'Tu sesión "Tutoría de Cálculo Diferencial" ha finalizado.',
            'type' => 'session_completed',
            'is_read' => true,
        ]);

        $this->command->info("Demo data created: {$createdSessions} completed sessions, " . count($tutorProfiles) . " approved tutors, " . count($studentUsers) . " students.");
    }
}

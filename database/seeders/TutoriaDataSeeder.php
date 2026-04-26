<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\TutorProfile;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\Review;
use App\Models\Token;
use App\Models\Notification;
use App\Models\Specialty;
use App\Models\TutorCourse;
use App\Models\PaymentReceipt;
use App\Models\SessionMessage;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TutorAvailability;

class TutoriaDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $password = Hash::make('password');

        // ═══════════════════════════════════════
        // TUTORES (6)
        // ═══════════════════════════════════════
        $tutorsData = [
            [
                'name' => 'Prof. María García',
                'email' => 'maria.garcia@tutoria.com',
                'phone' => '+58 412-1234567',
                'city' => 'Caracas',
                'country' => 'Venezuela',
                'bio' => 'Matemática con más de 10 años de experiencia. Especialista en cálculo y álgebra lineal.',
                'professional_title' => 'Magíster en Matemáticas Puras',
                'education_level' => 'Maestria',
                'years_experience' => 12,
                'hourly_rate' => 15.00,
                'specialties' => ['Matemáticas', 'Física'],
                'courses' => [
                    ['title' => 'Cálculo Diferencial', 'description' => 'Curso completo de derivadas y límites', 'institution' => 'UCV', 'year' => 2020],
                    ['title' => 'Álgebra Lineal Aplicada', 'description' => 'Matrices, transformaciones y espacios vectoriales', 'institution' => 'USB', 'year' => 2021],
                ],
            ],
            [
                'name' => 'Ing. Carlos Rodríguez',
                'email' => 'carlos.rodriguez@tutoria.com',
                'phone' => '+58 414-9876543',
                'city' => 'Maracaibo',
                'country' => 'Venezuela',
                'bio' => 'Ingeniero de sistemas con pasión por la programación. Full-stack developer.',
                'professional_title' => 'Ingeniero de Sistemas',
                'education_level' => 'Pregrado',
                'years_experience' => 8,
                'hourly_rate' => 20.00,
                'specialties' => ['Programación', 'Ingeniería'],
                'courses' => [
                    ['title' => 'React desde Cero', 'description' => 'Aprende React con proyectos prácticos', 'institution' => 'ULA', 'year' => 2023],
                    ['title' => 'Base de Datos SQL y NoSQL', 'description' => 'PostgreSQL, MySQL, MongoDB', 'institution' => 'LUZ', 'year' => 2022],
                    ['title' => 'APIs RESTful con Laravel', 'description' => 'Diseño y desarrollo de APIs profesionales', 'institution' => 'UDO', 'year' => 2023],
                ],
            ],
            [
                'name' => 'Lic. Ana Martínez',
                'email' => 'ana.martinez@tutoria.com',
                'phone' => '+58 416-5551234',
                'city' => 'Valencia',
                'country' => 'Venezuela',
                'bio' => 'Licenciada en idiomas ingleses. Certificada TOEFL iBT y IELTS.',
                'professional_title' => 'Licenciada en Idiomas Modernos',
                'education_level' => 'Pregrado',
                'years_experience' => 6,
                'hourly_rate' => 12.00,
                'specialties' => ['Inglés', 'Francés'],
                'courses' => [
                    ['title' => 'Preparación TOEFL', 'description' => 'Estrategias y práctica para el examen TOEFL iBT', 'institution' => 'UC', 'year' => 2022],
                ],
            ],
            [
                'name' => 'Dr. José Hernández',
                'email' => 'jose.hernandez@tutoria.com',
                'phone' => '+58 424-7778899',
                'city' => 'Caracas',
                'country' => 'Venezuela',
                'bio' => 'Doctor en química con experiencia en investigación y docencia universitaria.',
                'professional_title' => 'Doctor en Química',
                'education_level' => 'Doctorado',
                'years_experience' => 15,
                'hourly_rate' => 25.00,
                'specialties' => ['Química', 'Biología'],
                'courses' => [
                    ['title' => 'Química Orgánica Avanzada', 'description' => 'Mecanismos de reacción y síntesis', 'institution' => 'IVIC', 'year' => 2019],
                    ['title' => 'Bioquímica Molecular', 'description' => 'Proteínas, enzimas y metabolismo', 'institution' => 'UCV', 'year' => 2020],
                ],
            ],
            [
                'name' => 'Prof. Laura López',
                'email' => 'laura.lopez@tutoria.com',
                'phone' => '+58 412-3334455',
                'city' => 'Barquisimeto',
                'country' => 'Venezuela',
                'bio' => 'Abogada y profesora universitaria. Especialista en derecho constitucional.',
                'professional_title' => 'Abogada - Especialista en Derecho Constitucional',
                'education_level' => 'Especializacion',
                'years_experience' => 9,
                'hourly_rate' => 18.00,
                'specialties' => ['Derecho', 'Historia'],
                'courses' => [
                    ['title' => 'Derecho Constitucional Venezolano', 'description' => 'Análisis de la CRBV y jurisprudencia', 'institution' => 'UCLA', 'year' => 2021],
                ],
            ],
            [
                'name' => 'Ec. Roberto Sánchez',
                'email' => 'roberto.sanchez@tutoria.com',
                'phone' => '+58 414-6667788',
                'city' => 'Mérida',
                'country' => 'Venezuela',
                'bio' => 'Economista con maestría en finanzas. Consultor empresarial.',
                'professional_title' => 'Magíster en Finanzas',
                'education_level' => 'Maestria',
                'years_experience' => 11,
                'hourly_rate' => 22.00,
                'specialties' => ['Economía', 'Contabilidad'],
                'status' => 'pending',
                'courses' => [
                    ['title' => 'Macroeconomía para No Economistas', 'description' => 'Entender la economía de tu país', 'institution' => 'ULA', 'year' => 2023],
                ],
            ],
        ];

        $tutorProfiles = [];
        foreach ($tutorsData as $i => $t) {
            $status = $t['status'] ?? 'approved';
            unset($t['status']);

            $user = User::firstOrCreate([
                'name' => $t['name'],
                'email' => $t['email'],
                'password' => $password,
                'phone' => $t['phone'],
                'city' => $t['city'],
                'country' => $t['country'],
                'bio' => $t['bio'],
                'role' => 'tutor',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $specialtyNames = $t['specialties'];
            $coursesData = $t['courses'];
            unset($t['specialties'], $t['courses'], $t['name'], $t['email'], $t['phone'], $t['city'], $t['country'], $t['bio']);

            $t['user_id'] = $user->id;
            $t['status'] = $status;
            $t['is_approved'] = $status === 'approved';
            $t['approval_date'] = $status === 'approved' ? now()->subDays(rand(10, 90)) : null;
            $t['average_rating'] = $status === 'approved' ? rand(38, 50) / 10 : 0;
            $t['total_sessions'] = $status === 'approved' ? rand(5, 45) : 0;
            $t['total_warnings'] = $status === 'approved' ? rand(0, 2) : 0;

            $profile = TutorProfile::firstOrCreate($t);

            // Attach specialties via BelongsToMany relationship
            foreach ($specialtyNames as $sName) {
                $specialty = Specialty::where('name', $sName)->first();
                if ($specialty) {
                    $profile->specialties()->attach($specialty->id);
                }
            }

            // Create courses
            foreach ($coursesData as $c) {
                TutorCourse::create([
                    'tutor_profile_id' => $profile->id,
                    'title' => $c['title'],
                    'description' => $c['description'],
                    'file_path' => 'courses/' . Str::slug($c['title']) . '.pdf',
                    'institution' => $c['institution'],
                    'year' => $c['year'],
                ]);
            }

            // Create availabilities for approved tutors
            if ($status === 'approved') {
                $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                foreach ($days as $day) {
                    TutorAvailability::create([
                        'tutor_profile_id' => $profile->id,
                        'day_of_week' => $day,
                        'start_time' => '09:00:00',
                        'end_time' => '18:00:00',
                        'is_active' => true,
                    ]);
                }
            }

            $tutorProfiles[] = $profile;
        }

        // ═══════════════════════════════════════
        // ESTUDIANTES (10)
        // ═══════════════════════════════════════
        $studentsData = [
            ['name' => 'Pedro Jiménez', 'email' => 'pedro.jimenez@tutoria.com', 'phone' => '+58 412-1112233', 'city' => 'Caracas', 'education_level' => 'Pregrado', 'institution' => 'UCV'],
            ['name' => 'Camila Torres', 'email' => 'camila.torres@tutoria.com', 'phone' => '+58 414-2223344', 'city' => 'Maracaibo', 'education_level' => 'Pregrado', 'institution' => 'LUZ'],
            ['name' => 'Diego Morales', 'email' => 'diego.morales@tutoria.com', 'phone' => '+58 416-3334455', 'city' => 'Valencia', 'education_level' => 'Maestria', 'institution' => 'UC'],
            ['name' => 'Sofía Ramírez', 'email' => 'sofia.ramirez@tutoria.com', 'phone' => '+58 424-4445566', 'city' => 'Barquisimeto', 'education_level' => 'Pregrado', 'institution' => 'UCLA'],
            ['name' => 'Miguel Fernández', 'email' => 'miguel.fernandez@tutoria.com', 'phone' => '+58 412-5556677', 'city' => 'Mérida', 'education_level' => 'Doctorado', 'institution' => 'ULA'],
            ['name' => 'Valentina Rojas', 'email' => 'valentina.rojas@tutoria.com', 'phone' => '+58 414-6667788', 'city' => 'Caracas', 'education_level' => 'Pregrado', 'institution' => 'USB'],
            ['name' => 'Andrés Pérez', 'email' => 'andres.perez@tutoria.com', 'phone' => '+58 416-7778899', 'city' => 'Maracay', 'education_level' => 'Especializacion', 'institution' => 'UNEG'],
            ['name' => 'Isabella Contreras', 'email' => 'isabella.contreras@tutoria.com', 'phone' => '+58 424-8889900', 'city' => 'Caracas', 'education_level' => 'Pregrado', 'institution' => 'UCAB'],
            ['name' => 'Gabriel Vargas', 'email' => 'gabriel.vargas@tutoria.com', 'phone' => '+58 412-9990011', 'city' => 'Puerto Ordaz', 'education_level' => 'Pregrado', 'institution' => 'UNEXPO'],
            ['name' => 'Luciana Méndez', 'email' => 'luciana.mendez@tutoria.com', 'phone' => '+58 414-0001122', 'city' => 'Lechería', 'education_level' => 'Maestria', 'institution' => 'UDO'],
        ];

        $studentUsers = [];
        foreach ($studentsData as $s) {
            $user = User::firstOrCreate([
                'name' => $s['name'],
                'email' => $s['email'],
                'password' => $password,
                'phone' => $s['phone'],
                'city' => $s['city'],
                'country' => 'Venezuela',
                'role' => 'student',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            StudentProfile::firstOrCreate([
                'user_id' => $user->id,
                'education_level' => $s['education_level'],
                'institution' => $s['institution'],
                'total_sessions_completed' => 0,
            ]);

            $studentUsers[] = $user;
        }

        // ═══════════════════════════════════════
        // TOKENS (para estudiantes)
        // ═══════════════════════════════════════
        foreach ($studentUsers as $si => $student) {
            // Initial admin credit
            $initialTokens = rand(10, 50);
            Token::create([
                'user_id' => $student->id,
                'quantity' => $initialTokens,
                'transaction_type' => 'admin_credit',
                'amount' => null,
                'tokens_before' => 0,
                'tokens_after' => $initialTokens,
                'description' => 'Tokens iniciales de bienvenida',
                'reference' => 'BIENVENIDA-' . ($si + 1),
            ]);

            // Some students have purchases
            if ($si % 2 === 0) {
                $purchaseQty = rand(20, 100);
                $balance = $initialTokens + $purchaseQty;
                Token::create([
                    'user_id' => $student->id,
                    'quantity' => $purchaseQty,
                    'transaction_type' => 'purchase',
                    'amount' => rand(5, 30) + 0.50,
                    'tokens_before' => $initialTokens,
                    'tokens_after' => $balance,
                    'description' => 'Compra de paquete de tokens',
                    'reference' => 'COMPRA-' . ($si + 1),
                ]);
            }
        }

        // ═══════════════════════════════════════
        // SESIONES DE TUTORÍA
        // ═══════════════════════════════════════
        $sessionTitles = [
            'Introducción al Cálculo Diferencial',
            'Derivadas - Regla de la Cadena',
            'React Hooks - useState y useEffect',
            'Preparación TOEFL - Speaking Section',
            'Química Orgánica - Nomenclatura',
            'Derecho Constitucional - Art. 33 CRBV',
            'Ecuaciones Diferenciales Parciales',
            'JavaScript Avanzado - Closures',
            'IELTS Writing Task 2 Practice',
            'Estequiometría y Balanceo de Ecuaciones',
            'Probabilidad y Estadística Aplicada',
            'Python para Data Science',
            'Gramática Inglesa - Tiempos Verbales',
            'Mecánica Cuántica Básica',
            'Economía Internacional - Comercio',
            'Álgebra Lineal - Transformaciones',
            'API RESTful con Node.js',
            'Filosofía Política - Hobbes y Rousseau',
            'Bioquímica - Ciclo de Krebs',
            'Contabilidad de Costos - ABC',
        ];

        $approvedTutors = array_filter($tutorProfiles, fn($tp) => $tp->status === 'approved');
        $approvedTutors = array_values($approvedTutors);

        $sessions = [];
        foreach ($sessionTitles as $si => $title) {
            $tutor = $approvedTutors[$si % count($approvedTutors)];
            $student = $studentUsers[$si % count($studentUsers)];

            $rand = rand(0, 100);
            if ($rand < 45) {
                $status = 'completed';
            } elseif ($rand < 65) {
                $status = 'scheduled';
            } elseif ($rand < 75) {
                $status = 'in_progress';
            } else {
                $status = 'cancelled';
            }

            $scheduledAt = now()->subDays(rand(1, 30))->setHour(rand(8, 18))->setMinute(0);

            $session = TutoringSession::firstOrCreate([
                'tutor_profile_id' => $tutor->id,
                'student_user_id' => $student->id,
                'title' => $title,
                'description' => "Sesión de tutoría sobre {$title}",
                'scheduled_at' => $status === 'scheduled' ? now()->addDays(rand(1, 7)) : $scheduledAt,
                'started_at' => in_array($status, ['completed', 'in_progress']) ? (clone $scheduledAt)->addMinutes(rand(0, 5)) : null,
                'ended_at' => $status === 'completed' ? (clone $scheduledAt)->addMinutes(rand(45, 90)) : null,
                'duration_minutes' => [30, 45, 60, 90, 120][rand(0, 4)],
                'status' => $status,
                'tokens_cost' => rand(1, 3),
                'tutor_earned_tokens' => $status === 'completed' ? rand(1, 3) : 0,
                'meeting_link' => $status !== 'cancelled' ? 'https://meet.jit.si/' . Str::random(10) : null,
            ]);

            $sessions[] = $session;

            // Update student profile
            if ($status === 'completed') {
                $student->studentProfile->increment('total_sessions_completed');
            }

            // Create session messages for completed sessions
            if ($status === 'completed' && rand(0, 1)) {
                $messages = [
                    'Tengo una duda sobre el tema principal',
                    'Claro, vamos a revisarlo paso a paso',
                    'Entendido, gracias por la explicación',
                    'Excelente, si tienes más dudas puedes escribirme',
                ];
                foreach ($messages as $mi => $msg) {
                    SessionMessage::create([
                        'tutoring_session_id' => $session->id,
                        'user_id' => $mi % 2 === 0 ? $student->id : $tutor->user_id,
                        'message' => $msg,
                    ]);
                }
            }
        }

        // ═══════════════════════════════════════
        // REVIEWS (resenas y advertencias)
        // ═══════════════════════════════════════
        $reviewComments = [
            'Excelente tutor, muy claro en sus explicaciones.',
            'Me ayudó muchísimo a entender los conceptos difíciles.',
            'Puntual y profesional. Muy recomendado.',
            'Las sesiones son muy dinámicas y productivas.',
            'Tiene mucha paciencia y dominio del tema.',
            'Buen tutor, pero a veces va muy rápido.',
            'La clase fue muy útil para mi examen final.',
            'Explica de forma sencilla temas complejos.',
        ];

        $completedSessions = array_filter($sessions, fn($s) => $s->status === 'completed');
        $completedSessions = array_values($completedSessions);

        foreach ($completedSessions as $si => $session) {
            Review::create([
                'tutoring_session_id' => $session->id,
                'reviewer_user_id' => $session->student_user_id,
                'tutor_profile_id' => $session->tutor_profile_id,
                'rating' => rand(3, 5),
                'comment' => $reviewComments[$si % count($reviewComments)],
                'type' => 'review',
                'is_anonymous' => rand(0, 1) === 1,
            ]);
        }

        // Create some warnings
        $warningTutors = array_slice($approvedTutors, 0, 2);
        $warningReasons = [
            ['Falta de puntualidad recurrente', 'leve'],
            ['No se presentó a 3 sesiones programadas', 'moderada'],
        ];
        foreach ($warningTutors as $wi => $tutor) {
            Review::create([
                'tutoring_session_id' => null,
                'reviewer_user_id' => null,
                'tutor_profile_id' => $tutor->id,
                'rating' => 0,
                'comment' => $warningReasons[$wi][0],
                'type' => 'warning',
                'is_anonymous' => false,
                'severity' => $warningReasons[$wi][1],
            ]);
        }

        // ═══════════════════════════════════════
        // NOTIFICACIONES
        // ═══════════════════════════════════════
        $notificationTemplates = [
            ['Tu sesión ha sido programada', 'Recuerda estar puntual a tu próxima sesión.', 'session'],
            ['Nueva reseña recibida', 'Un estudiante dejó una reseña sobre tu sesión.', 'review'],
            ['Tokens recargados exitosamente', 'Se han acreditado tokens en tu cuenta.', 'token'],
            ['Tutor aprobado', 'Tu perfil de tutor ha sido aprobado.', 'system'],
            ['Recordatorio de sesión', 'Tienes una sesión programada para mañana.', 'reminder'],
            ['Nuevo mensaje recibido', 'Tienes un mensaje nuevo en la plataforma.', 'message'],
        ];

        // Notifications for admin
        $admin = User::where('email', 'admin@tutoria.com')->first();
        foreach (['Nuevo tutor registrado', 'Solicitud de retiro de tokens pendiente', 'Nueva reseña reportada'] as $nt) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => $nt,
                'message' => "Hay una nueva actividad que requiere tu atención: {$nt}.",
                'type' => 'admin',
                'is_read' => rand(0, 1) === 1,
            ]);
        }

        // Notifications for tutors
        foreach ($approvedTutors as $ti => $tutor) {
            for ($n = 0; $n < rand(2, 5); $n++) {
                $tpl = $notificationTemplates[$n % count($notificationTemplates)];
                Notification::create([
                    'user_id' => $tutor->user_id,
                    'title' => $tpl[0],
                    'message' => $tpl[1],
                    'type' => $tpl[2],
                    'is_read' => rand(0, 1) === 1,
                ]);
            }
        }

        // Notifications for students
        foreach ($studentUsers as $si => $student) {
            for ($n = 0; $n < rand(1, 4); $n++) {
                $tpl = $notificationTemplates[($n + $si) % count($notificationTemplates)];
                Notification::create([
                    'user_id' => $student->id,
                    'title' => $tpl[0],
                    'message' => $tpl[1],
                    'type' => $tpl[2],
                    'is_read' => rand(0, 1) === 1,
                ]);
            }
        }

        // ═══════════════════════════════════════
        // COMPROBANTES DE PAGO
        // ═══════════════════════════════════════
        $receiptStatuses = ['pending', 'pending', 'pending', 'approved', 'rejected'];
        foreach ($studentUsers as $si => $student) {
            if ($si >= 5) break;

            $status = $receiptStatuses[$si];
            $receipt = PaymentReceipt::create([
                'user_id' => $student->id,
                'tokens_requested' => rand(10, 50),
                'amount_paid' => rand(3, 20) + 0.50,
                'currency' => ['USD', 'VES'][rand(0, 1)],
                'bank_name' => ['Banco de Venezuela', 'Banesco', 'Mercantil', 'Provincial', 'BNC'][rand(0, 4)],
                'phone_number' => '0414-' . rand(1000000, 9999999),
                'reference_number' => rand(10000000, 99999999),
                'receipt_image_path' => null,
                'status' => $status,
                'admin_notes' => $status === 'rejected' ? 'Referencia no encontrada en el sistema' : null,
                'reviewed_at' => in_array($status, ['approved', 'rejected']) ? now()->subDays(rand(1, 5)) : null,
                'reviewed_by' => in_array($status, ['approved', 'rejected']) ? $admin->id : null,
            ]);
        }

        // ═══════════════════════════════════════
        // CONVERSACIONES Y MENSAJES
        // ═══════════════════════════════════════
        $conversationsCreated = [];
        foreach ($approvedTutors as $ti => $tutor) {
            // Each tutor has conversations with 2-3 students
            $numConversations = rand(1, 3);
            for ($c = 0; $c < $numConversations; $c++) {
                $studentIdx = ($ti + $c) % count($studentUsers);

                $exists = false;
                foreach ($conversationsCreated as $conv) {
                    if (
                        ($conv['student'] == $studentUsers[$studentIdx]->id && $conv['tutor'] == $tutor->user_id) ||
                        ($conv['student'] == $tutor->user_id && $conv['tutor'] == $studentUsers[$studentIdx]->id)
                    ) {
                        $exists = true;
                        break;
                    }
                }
                if ($exists) continue;

                $conversation = Conversation::create([
                    'student_user_id' => $studentUsers[$studentIdx]->id,
                    'tutor_user_id' => $tutor->user_id,
                    'last_message_at' => now()->subHours(rand(1, 48)),
                ]);

                $conversationsCreated[] = [
                    'student' => $studentUsers[$studentIdx]->id,
                    'tutor' => $tutor->user_id,
                ];

                // Create 2-6 messages per conversation
                $numMessages = rand(2, 6);
                $chatMessages = [
                    'Hola, tengo una consulta sobre la tutoría',
                    'Hola, claro, dime en qué puedo ayudarte',
                    'Quisiera programar una sesión para esta semana',
                    'Perfecto, tengo disponibilidad el jueves a las 3pm',
                    'Excelente, quedo registrado. Gracias',
                ];
                for ($m = 0; $m < $numMessages; $m++) {
                    Message::create([
                        'conversation_id' => $conversation->id,
                        'sender_user_id' => $m % 2 === 0 ? $studentUsers[$studentIdx]->id : $tutor->user_id,
                        'content' => $chatMessages[$m % count($chatMessages)],
                        'is_read' => $m < $numMessages - 1,
                        'read_at' => $m < $numMessages - 1 ? now()->subHours(rand(1, 24)) : null,
                    ]);
                }
            }
        }

        // ═══════════════════════════════════════
        // PRINT CREDENTIALS
        // ═══════════════════════════════════════
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info('  DATOS DE PRUEBA CREADOS EXITOSAMENTE');
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->newLine();

        $this->command->info('  ADMINISTRADOR:');
        $this->command->warn('    admin@tutoria.com  /  password');
        $this->command->newLine();

        $this->command->info('  TUTORES APROBADOS (5):');
        foreach (array_slice($tutorsData, 0, 5) as $td) {
            $this->command->warn("    {$td['email']}  /  password  ({$td['professional_title']})");
        }
        $this->command->newLine();

        $this->command->info('  TUTOR PENDIENTE (1):');
        $this->command->warn("    roberto.sanchez@tutoria.com  /  password  (requiere aprobación)");
        $this->command->newLine();

        $this->command->info('  ESTUDIANTES (10):');
        foreach ($studentsData as $sd) {
            $this->command->warn("    {$sd['email']}  /  password  ({$sd['institution']})");
        }
        $this->command->newLine();

        $this->command->info('═══════════════════════════════════════════════');
        $this->command->info('  TODOS LOS USUARIOS: password = password');
        $this->command->info('═══════════════════════════════════════════════');
        $this->command->newLine();
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a TutoriaApp!</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: system-ui, -apple-system, sans-serif;">
    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px;">
            <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">TutoriaApp</h1>
        </div>
        <!-- Body -->
        <div style="padding: 32px;">
            <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Hola {{ $name }},</p>

            <div style="text-align:center; margin:24px 0;">
                <h2 style="margin:0 0 8px; color:#6366f1; font-size:22px; font-weight:700;">&#127881; ¡Bienvenido a TutoriaApp!</h2>
            </div>

            @if($role === 'tutor')
                <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Nos alegra que te unas como tutor a nuestra comunidad. Ya puedes configurar tu perfil, definir tus especialidades y comenzar a ofrecer sesiones de tutoría.</p>

                <ul style="margin:0 0 24px; padding-left:20px; color:#374151; font-size:14px; line-height:2;">
                    <li>Completa tu perfil de tutor con tu información profesional</li>
                    <li>Define tus tarifas y horarios disponibles</li>
                    <li>Agrega tus especialidades</li>
                    <li>Espera la aprobación de tu perfil por un administrador</li>
                </ul>

                <div style="text-align:center; margin:32px 0;">
                    <a href="{{ url('/tutor/profile') }}" style="display:inline-block; background-color:#10b981; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600; font-size:16px;">Configurar mi Perfil</a>
                </div>
            @else
                <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">¡Bienvenido a TutoriaApp! Estamos encantados de tenerte como parte de nuestra comunidad de aprendizaje.</p>

                <ul style="margin:0 0 24px; padding-left:20px; color:#374151; font-size:14px; line-height:2;">
                    <li>Recarga tokens para acceder a sesiones de tutoría</li>
                    <li>Busca tutores por especialidad y calificación</li>
                    <li>Programa sesiones cuando lo necesites</li>
                    <li>Usa el pizarrón colaborativo durante las sesiones</li>
                </ul>

                <div style="text-align:center; margin:32px 0;">
                    <a href="{{ url('/student/dashboard') }}" style="display:inline-block; background-color:#10b981; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600; font-size:16px;">Explorar Tutores</a>
                </div>
            @endif

            <p style="margin:24px 0 0; color:#6b7280; font-size:14px; line-height:1.6;">Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

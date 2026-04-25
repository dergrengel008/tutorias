<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu correo electrónico - TutoriaApp</title>
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
            <p style="margin:0 0 24px; color:#374151; font-size:16px; line-height:1.6;">Gracias por registrarte en TutoriaApp. Para comenzar a utilizar la plataforma, necesitamos que verifiques tu dirección de correo electrónico.</p>
            <div style="text-align:center; margin:32px 0;">
                <a href="{{ $verificationUrl }}" style="display:inline-block; background-color:#10b981; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600; font-size:16px;">Verificar Correo Electrónico</a>
            </div>
            <p style="margin:0 0 12px; color:#6b7280; font-size:14px; line-height:1.6;">Si no creaste una cuenta en TutoriaApp, puedes ignorar este correo de forma segura.</p>
            <p style="margin:0 0 0; color:#6b7280; font-size:14px; line-height:1.6;">Este enlace expira en <strong>60 minutos</strong>.</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

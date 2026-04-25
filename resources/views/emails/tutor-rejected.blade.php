<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu perfil no fue aprobado - TutoriaApp</title>
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

            <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Lamentamos informarte que tu solicitud para ser tutor en TutoriaApp <strong>no ha sido aprobada</strong> en esta ocasión.</p>

            <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:16px; margin:16px 0; border-radius:0 8px 8px 0;">
                <p style="margin:0 0 4px; color:#92400e; font-size:14px; font-weight:600;">Motivo:</p>
                <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6;">{{ $reason }}</p>
            </div>

            <p style="margin:16px 0 16px; color:#374151; font-size:16px; line-height:1.6;">Puedes mejorar tu perfil y enviar una nueva solicitud cuando estés listo. Te recomendamos:</p>

            <ul style="margin:0 0 24px; padding-left:20px; color:#374151; font-size:14px; line-height:2;">
                <li>Revisar y completar toda tu información de perfil</li>
                <li>Agregar una foto de perfil profesional</li>
                <li>Incluir una descripción detallada de tu experiencia</li>
                <li>Subir documentación que respalde tus credenciales</li>
            </ul>

            <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.6;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

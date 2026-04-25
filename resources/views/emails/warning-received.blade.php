<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Has recibido una amonestación - TutoriaApp</title>
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

            <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Te informamos que has recibido una <strong>amonestación</strong> en TutoriaApp por incumplimiento de nuestras políticas.</p>

            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:20px; margin:16px 0; border-radius:0 8px 8px 0;">
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 0; color:#991b1b; font-size:14px; font-weight:600;">Severidad</td>
                        <td style="padding:8px 0; text-align:right;">
                            @if(strtolower($severity) === 'leve')
                                <span style="display:inline-block; background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:12px; font-size:13px; font-weight:600;">Leve</span>
                            @elseif(strtolower($severity) === 'moderada')
                                <span style="display:inline-block; background:#fed7aa; color:#9a3412; padding:4px 12px; border-radius:12px; font-size:13px; font-weight:600;">Moderada</span>
                            @else
                                <span style="display:inline-block; background:#fecaca; color:#991b1b; padding:4px 12px; border-radius:12px; font-size:13px; font-weight:600;">Grave</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; color:#991b1b; font-size:14px; font-weight:600; vertical-align:top;">Motivo</td>
                        <td style="padding:8px 0; color:#991b1b; font-size:14px; text-align:right;">{{ $reason }}</td>
                    </tr>
                </table>
            </div>

            <p style="margin:16px 0 16px; color:#374151; font-size:16px; line-height:1.6;">Te pedimos revisar nuestros términos y condiciones para evitar futuras amonestaciones. El acumulamiento de amonestaciones graves puede resultar en la suspensión de tu cuenta.</p>

            <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.6;">Si consideras que esta amonestación es un error, por favor contacta a nuestro equipo de soporte.</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

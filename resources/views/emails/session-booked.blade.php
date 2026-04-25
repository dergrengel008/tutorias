<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva sesión programada - TutoriaApp</title>
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

            @if($role === 'student')
                <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">¡Tu sesión ha sido programada exitosamente! Aquí tienes los detalles:</p>
            @else
                <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">¡Tienes una nueva sesión programada! Un estudiante ha reservado una tutoría contigo:</p>
            @endif

            <table style="width:100%; margin:24px 0; border-collapse:collapse;">
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; font-weight:600; width:40%;">Sesión</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-size:14px;">{{ $sessionTitle }}</td>
                </tr>
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; font-weight:600;">Fecha y hora</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-size:14px;">{{ $scheduledAt }}</td>
                </tr>
                @if($role === 'student')
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; font-weight:600;">Tutor</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-size:14px;">{{ $tutorName }}</td>
                </tr>
                @else
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; font-weight:600;">Estudiante</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-size:14px;">{{ $studentName }}</td>
                </tr>
                @endif
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#6b7280; font-size:14px; font-weight:600;">Tokens</td>
                    <td style="padding:12px 0; border-bottom:1px solid #e5e7eb; color:#374151; font-size:14px;">{{ $tokens }} token{{ $tokens !== 1 ? 's' : '' }}</td>
                </tr>
            </table>

            <p style="margin:16px 0 0; color:#6b7280; font-size:14px; line-height:1.6;">Asegúrate de estar presente a la hora indicada. Recibirás una notificación cuando la sesión comience.</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

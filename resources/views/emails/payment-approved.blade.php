<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recarga aprobada - TutoriaApp</title>
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

            <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">¡Tu recarga de tokens ha sido <strong>aprobada</strong> exitosamente!</p>

            <div style="background:#ecfdf5; border-left:4px solid #10b981; padding:20px; margin:20px 0; border-radius:0 8px 8px 0;">
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 0; color:#065f46; font-size:14px; font-weight:600;">Tokens recargados</td>
                        <td style="padding:8px 0; color:#065f46; font-size:14px; font-weight:700; text-align:right;">+{{ $tokens }} token{{ $tokens !== 1 ? 's' : '' }}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0; color:#065f46; font-size:14px; font-weight:600;">Nuevo saldo</td>
                        <td style="padding:8px 0; color:#065f46; font-size:14px; font-weight:700; text-align:right;">{{ $newBalance }} token{{ $newBalance !== 1 ? 's' : '' }}</td>
                    </tr>
                </table>
            </div>

            <p style="margin:16px 0 0; color:#374151; font-size:16px; line-height:1.6;">Ya puedes usar tus tokens para programar sesiones de tutoría. ¡Disfruta aprendiendo!</p>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

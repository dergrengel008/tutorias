<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recarga rechazada - TutoriaApp</title>
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

            <p style="margin:0 0 16px; color:#374151; font-size:16px; line-height:1.6;">Lamentamos informarte que tu solicitud de recarga de tokens <strong>no ha podido ser procesada</strong>.</p>

            <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:16px; margin:16px 0; border-radius:0 8px 8px 0;">
                <p style="margin:0 0 4px; color:#991b1b; font-size:14px; font-weight:600;">Motivo:</p>
                <p style="margin:0; color:#991b1b; font-size:14px; line-height:1.6;">{{ $reason }}</p>
            </div>

            <p style="margin:16px 0 16px; color:#374151; font-size:16px; line-height:1.6;">Puedes intentar realizar una nueva recarga en cualquier momento. Si el problema persiste, por favor contacta a soporte.</p>

            <div style="text-align:center; margin:32px 0;">
                <a href="{{ url('/tokens') }}" style="display:inline-block; background-color:#10b981; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600; font-size:16px;">Intentar de Nuevo</a>
            </div>
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; {{ date('Y') }} TutoriaApp. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>

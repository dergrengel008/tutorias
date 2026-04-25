import DefaultLayout from '@/Layouts/DefaultLayout';
import { FileText, Scale } from 'lucide-react';

export default function Terms() {
    const sections = [
        {
            title: '1. Aceptación',
            content:
                'Al acceder y utilizar TutoriaApp, usted acepta quedar vinculado por estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, se le prohíbe utilizar o acceder a nuestra plataforma. Estos términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen TutoriaApp. El uso continuado de la plataforma después de cualquier cambio en los términos constituye la aceptación de dichos cambios por parte del usuario.',
        },
        {
            title: '2. Descripción del Servicio',
            content:
                'TutoriaApp es una plataforma en línea que conecta a estudiantes con tutores calificados para recibir clases particulares virtuales. Nuestro servicio facilita la programación de sesiones de tutoría, la comunicación entre estudiantes y tutores, y el procesamiento de pagos mediante un sistema de tokens. TutoriaApp actúa como intermediario y no es responsable directo de la calidad de las tutorías impartidas, aunque supervisa y evalúa a los tutores para garantizar un servicio de calidad.',
        },
        {
            title: '3. Registro y Cuentas',
            content:
                'Para utilizar nuestros servicios, debe crear una cuenta proporcionando información veraz y completa. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. Debe notificarnos inmediatamente de cualquier uso no autorizado de su cuenta. Es obligatorio tener al menos 18 años o contar con el consentimiento de un tutor legal para registrarse. Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.',
        },
        {
            title: '4. Conducta del Usuario',
            content:
                'Los usuarios se comprometen a utilizar la plataforma de manera respetuosa y profesional. Queda prohibido el acoso, la discriminación, el uso de lenguaje ofensivo, o cualquier comportamiento inapropiado durante las sesiones de tutoría o en los mensajes de la plataforma. No se permite compartir contenido ilegal, ofensivo o que infrinja derechos de terceros. El incumplimiento de estas normas puede resultar en la suspensión o cancelación permanente de la cuenta, sin derecho a reembolso de tokens pendientes.',
        },
        {
            title: '5. Pagos y Tokens',
            content:
                'TutoriaApp utiliza un sistema de tokens como método de pago interno. Los tokens se adquieren mediante compra directa en la plataforma y se utilizan para pagar las sesiones de tutoría. El precio de los tokens puede variar según las promociones vigentes. Los tokens adquiridos no tienen fecha de vencimiento y no son reembolsables en efectivo, salvo en casos específicos de cancelación de sesión según nuestra política. Los tutores reciben el pago de sus servicios en tokens, los cuales pueden solicitar retirar según los términos y condiciones vigentes para retiros.',
        },
        {
            title: '6. Propiedad Intelectual',
            content:
                'Todo el contenido de TutoriaApp, incluyendo pero no limitado a logos, textos, gráficos, interfaces, código fuente y diseño, es propiedad de TutoriaApp y está protegido por las leyes de propiedad intelectual aplicables. Los materiales creados durante las sesiones de tutoría, como notas y documentos compartidos en la pizarra, son propiedad de los respectivos creadores. Los usuarios otorgan a TutoriaApp una licencia limitada para almacenar y mostrar dichos materiales dentro de la plataforma con fines de funcionamiento del servicio.',
        },
        {
            title: '7. Limitación de Responsabilidad',
            content:
                'TutoriaApp no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar la plataforma. Nuestra responsabilidad total no excederá el monto pagado por el usuario en los últimos treinta (30) días. No garantizamos que la plataforma estará disponible de manera ininterrumpida, libre de errores o segura. Los usuarios reconocen que utilizan la plataforma bajo su propio riesgo y deben verificar la información obtenida durante las tutorías.',
        },
        {
            title: '8. Modificaciones',
            content:
                'TutoriaApp se reserva el derecho de modificar estos Términos de Servicio en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en la plataforma. Notificaremos a los usuarios sobre cambios significativos mediante correo electrónico o notificación dentro de la plataforma. El uso continuado de TutoriaApp después de la publicación de cambios constituye la aceptación de los nuevos términos. Se recomienda revisar esta página periódicamente para estar al tanto de las actualizaciones.',
        },
        {
            title: '9. Ley Aplicable',
            content:
                'Estos Términos de Servicio se rigen por las leyes del país donde TutoriaApp tiene su domicilio principal. Cualquier disputa que surja en relación con estos términos será sometida a la jurisdicción exclusiva de los tribunales competentes del mencionado territorio. Si alguna disposición de estos términos es considerada inválida o inaplicable, las disposiciones restantes seguirán en pleno vigor y efecto. El incumplimiento de estos términos por parte de TutoriaApp no constituirá una renuncia a ningún derecho bajo estos términos.',
        },
    ];

    return (
        <DefaultLayout>
            <div className="bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
                            <Scale className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Términos de Servicio
                        </h1>
                        <p className="mt-3 text-sm text-gray-500">
                            Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-xl shadow-gray-200/50 space-y-8">
                        {sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                                    {section.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="mt-8 rounded-xl bg-indigo-50 border border-indigo-100 p-5 text-center">
                        <p className="text-sm text-indigo-700">
                            Si tienes preguntas sobre estos Términos de Servicio, contáctanos a través de nuestro{' '}
                            <a href="#" className="font-semibold underline hover:text-indigo-800">
                                formulario de contacto
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}

import DefaultLayout from '@/Layouts/DefaultLayout';
import { FileText, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    const sections = [
        {
            title: '1. Información que Recopilamos',
            content:
                'Recopilamos información personal que usted nos proporciona directamente al crear una cuenta, como su nombre, correo electrónico, fotografía de perfil y rol (estudiante o tutor). También recopilamos información académica y profesional relevante para los perfiles de tutores. Adicionalmente, recogemos información técnica automáticamente, incluyendo su dirección IP, tipo de navegador, sistema operativo y datos de uso de la plataforma para mejorar nuestros servicios y garantizar la seguridad del sistema.',
        },
        {
            title: '2. Cómo Usamos tu Información',
            content:
                'Utilizamos la información recopilada para proporcionar y mejorar nuestros servicios de tutoría, procesar pagos y gestionar su cuenta. La información académica se utiliza para conectar a estudiantes con tutores adecuados según sus necesidades. También empleamos los datos para enviar notificaciones importantes sobre su cuenta, sesiones programadas y actualizaciones de la plataforma. Analizamos datos de uso de forma agregada para mejorar la experiencia del usuario y desarrollar nuevas funcionalidades que satisfagan mejor las necesidades de nuestra comunidad.',
        },
        {
            title: '3. Compartir Información',
            content:
                'No vendemos ni alquilamos su información personal a terceros. Solo compartimos su información en las siguientes circunstancias: con otros usuarios dentro del contexto de las sesiones de tutoría (estudiantes ven el perfil del tutor y viceversa), con proveedores de servicios que nos ayudan a operar la plataforma bajo acuerdos de confidencialidad, y cuando sea requerido por ley o para proteger los derechos y seguridad de TutoriaApp, sus usuarios o el público. Los tutores pueden ver el nombre y la fotografía de los estudiantes que contratan sus servicios.',
        },
        {
            title: '4. Almacenamiento y Seguridad',
            content:
                'Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra el acceso no autorizado, alteración, divulgación o destrucción. Esto incluye cifrado de datos sensibles, firewalls, controles de acceso y auditorías de seguridad periódicas. Almacenamos sus datos en servidores seguros ubicados en centros de datos certificados. Sin embargo, ningún sistema de seguridad es completamente infalible, por lo que no podemos garantizar la seguridad absoluta de su información.',
        },
        {
            title: '5. Tus Derechos',
            content:
                'Usted tiene derecho a acceder, corregir, actualizar o eliminar su información personal en cualquier momento a través de la configuración de su cuenta. También puede solicitar una copia de todos los datos personales que tenemos sobre usted. Si desea eliminar su cuenta, podemos procesar su solicitud y eliminar sus datos, con la excepción de la información que debamos conservar por motivos legales o para resolver disputas. Para ejercer cualquiera de estos derechos, puede contactarnos directamente a través de nuestro formulario de soporte.',
        },
        {
            title: '6. Cookies',
            content:
                'Utilizamos cookies y tecnologías similares para mejorar su experiencia en TutoriaApp. Las cookies esenciales son necesarias para el funcionamiento básico de la plataforma, incluyendo la autenticación y la seguridad de sesión. También utilizamos cookies de rendimiento para analizar cómo los usuarios interactúan con la plataforma y cookies de funcionalidad para recordar sus preferencias. Puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad de ciertas características de la plataforma.',
        },
        {
            title: '7. Cambios a esta Política',
            content:
                'Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Cualquier cambio será publicado en esta página con una fecha de última actualización revisada. Notificaremos a los usuarios sobre cambios significativos mediante correo electrónico o notificación visible dentro de la plataforma antes de que entren en vigencia. Le recomendamos revisar esta política periódicamente para mantenerse informado sobre cómo protegemos su información. El uso continuado de la plataforma después de los cambios implica la aceptación de la política actualizada.',
        },
        {
            title: '8. Contacto',
            content:
                'Si tiene preguntas, preocupaciones o solicitudes relacionadas con esta Política de Privacidad o el manejo de su información personal, puede contactarnos a través del correo electrónico de soporte de la plataforma o mediante el formulario de contacto disponible en la sección de ayuda. Nuestro equipo de soporte se compromete a responder a todas las consultas relacionadas con la privacidad en un plazo máximo de 30 días hábiles. Valoramos su confianza y trabajamos continuamente para proteger su información.',
        },
    ];

    return (
        <DefaultLayout>
            <div className="bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Política de Privacidad
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
                            Si tienes preguntas sobre esta Política de Privacidad, contáctanos a través de nuestro{' '}
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

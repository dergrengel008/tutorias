import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setShow(false);
    };

    const reject = () => {
        localStorage.setItem('cookie_consent', 'rejected');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-indigo-600 shrink-0" />
                    <p className="text-sm text-gray-600">
                        Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
                        <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">política de cookies</a>.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={reject}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={accept}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}

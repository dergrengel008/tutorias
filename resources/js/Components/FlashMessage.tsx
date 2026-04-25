import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function FlashMessage() {
    const { props } = usePage();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const flash = props.flash as { success?: string; error?: string };

    const hasMessage = flash?.success || flash?.error;

    useEffect(() => {
        if (hasMessage && !dismissed) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [flash, dismissed]);

    const handleDismiss = () => {
        setVisible(false);
        setDismissed(true);
    };

    if (!visible || !hasMessage) return null;

    const isSuccess = !!flash.success;
    const message = flash.success || flash.error || '';

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                    visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                } ${
                    isSuccess
                        ? 'border border-green-200 bg-green-50 text-green-800'
                        : 'border border-red-200 bg-red-50 text-red-800'
                }`}
            >
                <div className="flex-shrink-0 mt-0.5">
                    {isSuccess ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                </div>
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={handleDismiss}
                    className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${
                        isSuccess ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

import { usePage, router } from '@inertiajs/react';
import { Globe } from 'lucide-react';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function LanguageSwitcher() {
    const { props } = usePage();
    const currentLocale = (props.locale as string) || 'es';

    const switchLanguage = (code: string) => {
        if (code === currentLocale) return;
        router.visit(window.location.pathname, {
            data: { lang: code },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const current = languages.find(l => l.code === currentLocale) || languages[0];

    return (
        <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{current.flag} {current.name}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                            lang.code === currentLocale
                                ? 'text-indigo-600 font-medium bg-indigo-50'
                                : 'text-gray-700'
                        }`}
                    >
                        <span>{lang.flag}</span>
                        {lang.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

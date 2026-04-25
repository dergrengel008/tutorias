import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const errorStr = this.state.error?.message || '';
            const isDataError = errorStr.includes('undefined') ||
                errorStr.includes('null') ||
                errorStr.includes('toLocaleString') ||
                errorStr.includes('.map') ||
                errorStr.includes('current is not a function') ||
                errorStr.includes('Cannot read properties');

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
                        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>

                        {isDataError ? (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Cargando datos...
                                </h2>
                                <p className="text-gray-500 mb-6">
                                    Los datos de esta página aún no están disponibles. 
                                    Esto es normal si la base de datos aún no está configurada 
                                    o si no has ejecutado las migraciones.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-sm text-gray-600 font-medium mb-2">
                                        Para solucionarlo, ejecuta en tu terminal:
                                    </p>
                                    <code className="block bg-gray-800 text-green-400 text-xs p-3 rounded-lg font-mono">
                                        php artisan migrate --seed
                                    </code>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Ir al Inicio
                                    </button>
                                    <button
                                        onClick={this.handleRetry}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    Algo salió mal
                                </h2>
                                <p className="text-gray-500 mb-4">
                                    Ocurrió un error inesperado en esta página.
                                </p>
                                {this.state.error && (
                                    <details className="text-left bg-red-50 rounded-lg p-3 mb-4">
                                        <summary className="text-sm font-medium text-red-700 cursor-pointer">
                                            Ver detalles del error
                                        </summary>
                                        <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40">
                                            {this.state.error.message}
                                        </pre>
                                    </details>
                                )}
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Ir al Inicio
                                    </button>
                                    <button
                                        onClick={this.handleRetry}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

import { Component } from 'react';
import { XCircleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * ErrorBoundary Component
 * 
 * Componente de clase que captura errores en el árbol de componentes hijos.
 * Muestra una UI de fallback dark mode con opciones para:
 * - Reintentar (recargar el componente)
 * - Volver al inicio
 * 
 * Uso:
 * <ErrorBoundary>
 *   <ComponenteQuePodriaFallar />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Actualizar estado para mostrar UI de fallback
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Loguear error (en producción podrías enviarlo a Sentry)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Aquí podrías integrar un servicio de logging como Sentry
        // if (import.meta.env.PROD) {
        //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
        // }
    }

    handleReset = () => {
        // Reset del estado para reintentar
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        // Navegar al inicio
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // UI de fallback dark mode
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-[var(--reservations-bg-primary)] px-4">
                    <div className="max-w-md w-full bg-[var(--reservations-bg-secondary)] rounded-2xl border border-[var(--reservations-border-primary)] p-8 text-center">
                        {/* Icono de error */}
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-red-900/20 p-4">
                                <XCircleIcon className="h-16 w-16 text-red-500" />
                            </div>
                        </div>

                        {/* Título */}
                        <h1 className="text-2xl font-bold text-[var(--reservations-text-primary)] mb-3">
                            Algo salió mal
                        </h1>

                        {/* Descripción */}
                        <p className="text-[var(--reservations-text-tertiary)] mb-6">
                            Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta de nuevo o regresa al inicio.
                        </p>

                        {/* Detalles del error (solo en desarrollo) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-[var(--reservations-bg-primary)] rounded-lg border border-[var(--reservations-border-secondary)] text-left">
                                <p className="text-xs font-mono text-red-400 mb-2 break-words">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="text-xs text-[var(--reservations-text-muted)] mt-2">
                                        <summary className="cursor-pointer hover:text-[var(--reservations-text-tertiary)] transition-colors">
                                            Ver stack trace
                                        </summary>
                                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[10px]">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Botón Reintentar */}
                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                <ArrowPathIcon className="h-5 w-5" />
                                Reintentar
                            </button>

                            {/* Botón Volver al Inicio */}
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 bg-[var(--reservations-bg-tertiary)] hover:bg-gray-600 text-[var(--reservations-text-primary)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                <HomeIcon className="h-5 w-5" />
                                Ir al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Si no hay error, renderizar children normalmente
        return this.props.children;
    }
}

export default ErrorBoundary;

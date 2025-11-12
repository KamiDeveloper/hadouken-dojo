import { Component } from 'react';
import { isChunkLoadError, handleChunkError } from '../utils/lazyWithRetry';

/**
 * Error Boundary para capturar errores de lazy loading
 * Maneja automáticamente errores de chunks obsoletos
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);

        // Si es error de chunk load, intentar recargar
        if (isChunkLoadError(error)) {
            handleChunkError();
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
                    <div className="max-w-md text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Algo salió mal
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Hubo un problema al cargar esta sección. Por favor, intenta recargar la página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

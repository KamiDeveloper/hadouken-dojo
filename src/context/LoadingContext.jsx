import React, { createContext, useContext } from 'react';
import useAssetLoader from '../hooks/useAssetLoader';

// Crear el contexto
const LoadingContext = createContext(null);

/**
 * Provider que maneja el estado de carga global
 * Usa el hook useAssetLoader internamente y provee el estado a toda la app
 */
export const LoadingProvider = ({ children }) => {
    const { isLoading, progress, loadedAssets } = useAssetLoader();

    return (
        <LoadingContext.Provider value={{ isLoading, progress, loadedAssets }}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * Hook personalizado para acceder al contexto de carga
 * Uso: const { isLoading, progress, loadedAssets } = useLoading();
 */
export const useLoading = () => {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error('useLoading debe ser usado dentro de un LoadingProvider');
    }

    return context;
};

export default LoadingContext;

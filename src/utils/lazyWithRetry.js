/**
 * Lazy import con retry automático para manejar errores de red
 * Útil en móviles con conexiones inestables y después de deployments
 * 
 * @param {Function} componentImport - Función que retorna import()
 * @param {Number} retries - Número de reintentos (default: 3)
 * @param {Number} interval - Tiempo entre reintentos en ms (default: 1000)
 * @returns {Promise} - Promise que resuelve al componente
 */
export const lazyWithRetry = (componentImport, retries = 3, interval = 1000) => {
    return new Promise((resolve, reject) => {
        const attemptImport = (retriesLeft) => {
            componentImport()
                .then(resolve)
                .catch((error) => {
                    // Si no quedan reintentos, rechazar
                    if (retriesLeft === 0) {
                        console.error('[LazyRetry] Failed after all retries:', error);
                        reject(error);
                        return;
                    }

                    console.warn(`[LazyRetry] Import failed, retrying... (${retriesLeft} attempts left)`);

                    // Esperar y reintentar
                    setTimeout(() => {
                        attemptImport(retriesLeft - 1);
                    }, interval);
                });
        };

        attemptImport(retries);
    });
};

/**
 * Detección de error por versión obsoleta
 * Si el error contiene el hash del chunk, probablemente sea cache
 */
export const isChunkLoadError = (error) => {
    return error?.message?.includes('Failed to fetch dynamically imported module');
};

/**
 * Forzar recarga de la página cuando hay error de chunk
 * Solo lo hace una vez para evitar loops infinitos
 */
export const handleChunkError = () => {
    const hasReloaded = sessionStorage.getItem('chunk-reload');

    if (!hasReloaded) {
        sessionStorage.setItem('chunk-reload', 'true');
        console.warn('[ChunkError] Reloading page to fetch new chunks...');
        window.location.reload();
    } else {
        console.error('[ChunkError] Already reloaded once, showing error to user');
        sessionStorage.removeItem('chunk-reload');
    }
};

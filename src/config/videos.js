/**
 * Configuración centralizada de videos responsivos
 * Permite gestionar fácilmente los videos por dispositivo
 */

export const VIDEO_CONFIG = {
    hero: {
        mobile: {
            src: "/assets/videos/hero-mobile-vertical.mp4",
            maxWidth: 767,
            orientation: 'portrait'
        },
        desktop: {
            src: "/assets/videos/hero-video.mp4",
            minWidth: 768
        }
    },
    // Agregar más videos aquí en el futuro si es necesario
    // example: {
    //     mobile: { src: "/assets/videos/example-mobile.mp4", maxWidth: 767 },
    //     desktop: { src: "/assets/videos/example-desktop.mp4", minWidth: 768 }
    // }
};

/**
 * Obtiene la configuración de video según el dispositivo
 * @param {string} videoKey - La clave del video en VIDEO_CONFIG (ej: 'hero')
 * @param {boolean} isMobile - Si es dispositivo móvil
 * @returns {object} Configuración del video
 */
export const getVideoConfig = (videoKey, isMobile) => {
    const config = VIDEO_CONFIG[videoKey];
    if (!config) {
        console.warn(`Video config not found for key: ${videoKey}`);
        return null;
    }
    return isMobile ? config.mobile : config.desktop;
};

/**
 * Obtiene el src del video según el dispositivo
 * @param {string} videoKey - La clave del video en VIDEO_CONFIG
 * @param {boolean} isMobile - Si es dispositivo móvil
 * @returns {string} URL del video
 */
export const getVideoSrc = (videoKey, isMobile) => {
    const config = getVideoConfig(videoKey, isMobile);
    return config?.src || '';
};

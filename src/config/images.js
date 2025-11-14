/**
 * Configuración centralizada de imágenes responsive
 * Optimiza el uso de bandwidth descargando solo la imagen necesaria según el dispositivo
 * 
 * Estructura:
 * - Desktop/Tablet: Imágenes normales en /assets/images/
 * - Mobile: Imágenes optimizadas en /assets/images/images-mobile/ con sufijo -mobile.webp
 */

export const IMAGE_CONFIG = {
    // Hero section
    biglogo: {
        desktop: '/assets/images/biglogo.webp',
        mobile: '/assets/images/images-mobile/biglogo-mobile.webp'
    },

    // MaskedArt section
    artUpper: {
        desktop: '/assets/images/art-upper.jpg',
        mobile: '/assets/images/images-mobile/art-upper-mobile.webp'
    },

    // CSS mask image (usado en index.css) - NOTA: Requiere JS para cambiar dinámicamente
    tekkenMask: {
        desktop: '/assets/images/Tekken-8-mask-img.png',
        mobile: '/assets/images/images-mobile/Tekken-8-mask-img-mobile.webp'
    },

    // Art section - Usar desktop para ambos (no hay versiones mobile aún)
    art1: {
        desktop: '/assets/images/art_1.webp',
        mobile: '/assets/images/art_1.webp' // Usar desktop temporalmente
    },
    art2: {
        desktop: '/assets/images/art_2.webp',
        mobile: '/assets/images/art_2.webp' // Usar desktop temporalmente
    },
    art3: {
        desktop: '/assets/images/art_3.webp',
        mobile: '/assets/images/art_3.webp' // Usar desktop temporalmente
    }
};

/**
 * Obtiene la ruta de la imagen según el dispositivo
 * @param {string} imageName - Nombre de la imagen en IMAGE_CONFIG
 * @param {boolean} isMobile - Si el dispositivo es móvil (< 768px)
 * @returns {string} - Ruta de la imagen optimizada
 */
export const getImageSrc = (imageName, isMobile = false) => {
    const imageConfig = IMAGE_CONFIG[imageName];

    if (!imageConfig) {
        console.warn(`[ImageConfig] Imagen "${imageName}" no encontrada en configuración`);
        return '';
    }

    return isMobile ? imageConfig.mobile : imageConfig.desktop;
};

/**
 * Hook helper para usar con useMediaQuery
 * Uso: const imgSrc = getImageSrc('biglogo', isMobile)
 */

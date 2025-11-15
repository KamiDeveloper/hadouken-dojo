import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context para breakpoints responsive centralizados
 * Usa un solo listener de resize para toda la app
 * Mucho más eficiente que múltiples useMediaQuery
 */
const ResponsiveContext = createContext();

/**
 * Breakpoints estandarizados
 */
export const BREAKPOINTS = {
    mobile: 767,      // 0-767px
    tablet: 1023,     // 768-1023px
    desktop: 1024     // 1024px+
};

/**
 * Provider que maneja todos los breakpoints de forma centralizada
 */
export const ResponsiveProvider = ({ children }) => {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );

    // Estado calculado de breakpoints
    const [breakpoints, setBreakpoints] = useState({
        isMobile: windowWidth <= BREAKPOINTS.mobile,
        isTablet: windowWidth > BREAKPOINTS.mobile && windowWidth <= BREAKPOINTS.tablet,
        isDesktop: windowWidth > BREAKPOINTS.tablet,
        width: windowWidth
    });

    useEffect(() => {
        // Handler optimizado con debounce
        let timeoutId;

        const handleResize = () => {
            // Cancelar timeout anterior
            clearTimeout(timeoutId);

            // Debounce de 150ms para evitar demasiados re-renders
            timeoutId = setTimeout(() => {
                const width = window.innerWidth;
                setWindowWidth(width);
                setBreakpoints({
                    isMobile: width <= BREAKPOINTS.mobile,
                    isTablet: width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet,
                    isDesktop: width > BREAKPOINTS.tablet,
                    width
                });
            }, 150);
        };

        // Listener pasivo para mejor performance
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <ResponsiveContext.Provider value={breakpoints}>
            {children}
        </ResponsiveContext.Provider>
    );
};

/**
 * Hook para acceder a los breakpoints
 * @returns {{ isMobile: boolean, isTablet: boolean, isDesktop: boolean, width: number }}
 */
export const useResponsive = () => {
    const context = useContext(ResponsiveContext);

    if (!context) {
        throw new Error('useResponsive must be used within ResponsiveProvider');
    }

    return context;
};

/**
 * Hook de compatibilidad para reemplazar useMediaQuery({ maxWidth: 767 })
 * @returns {boolean} - true si es móvil
 */
export const useIsMobile = () => {
    const { isMobile } = useResponsive();
    return isMobile;
};

/**
 * Hook para tablet
 * @returns {boolean} - true si es tablet
 */
export const useIsTablet = () => {
    const { isTablet } = useResponsive();
    return isTablet;
};

/**
 * Hook para desktop
 * @returns {boolean} - true si es desktop
 */
export const useIsDesktop = () => {
    const { isDesktop } = useResponsive();
    return isDesktop;
};

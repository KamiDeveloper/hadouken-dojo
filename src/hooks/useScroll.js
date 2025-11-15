import { useState, useEffect } from 'react';

/**
 * Hook centralizado para tracking de scroll con RAF optimization
 * Evita múltiples listeners de scroll en diferentes componentes
 * 
 * @param {number} threshold - Umbral de scroll en px (default: 50)
 * @returns {{ scrollY: number, isScrolled: boolean }}
 * 
 * @example
 * const { scrollY, isScrolled } = useScroll(50);
 */
export function useScroll(threshold = 50) {
    const [scrollY, setScrollY] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    setScrollY(currentScrollY);
                    setIsScrolled(currentScrollY > threshold);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return { scrollY, isScrolled };
}

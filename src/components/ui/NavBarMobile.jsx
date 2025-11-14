import { useState, useEffect } from 'react';
import logo from '/assets/images/images-mobile/logoland-mobile.webp';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HamburguerMenu from './HamburguerMenu';

const NavBarMobile = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [isScrolled, setIsScrolled] = useState(false);

    // Framer Motion scroll tracking (mismo que desktop)
    const { scrollY } = useScroll();
    const scrollRange = [0, 150]; // Rango más corto para móvil

    const backgroundOpacity = useTransform(scrollY, scrollRange, [0, 0.35]);
    const backdropBlur = useTransform(scrollY, scrollRange, [0, 10]);

    const backgroundColor = useTransform(
        backgroundOpacity,
        (v) => `rgba(26, 26, 26, ${v})`
    );
    const backdropFilterValue = useTransform(
        backdropBlur,
        (v) => `blur(${v}px)`
    );

    // Track scroll state
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            style={{
                backgroundColor: isHome ? backgroundColor : 'rgba(26, 26, 26, 0.35)',
                backdropFilter: isHome ? backdropFilterValue : 'blur(12px)',
                WebkitBackdropFilter: isHome ? backdropFilterValue : 'blur(12px)',
            }}
            className="flex h-16 w-full fixed z-50 items-center px-4"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            id='navbar-mobile'
        >
            {/* Logo a la izquierda */}
            <motion.div
                whileTap={{ scale: 0.95 }}
            >
                <img className='h-12 select-none pointer-events-none' src={logo} alt="Logo" />
            </motion.div>

            {/* Menú hamburguesa - fixed via CSS */}
            <HamburguerMenu />
        </motion.nav>
    );
};

export default NavBarMobile;

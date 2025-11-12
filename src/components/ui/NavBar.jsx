import { useState, useEffect } from 'react';
import logo from '/assets/images/logoland.webp';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMediaQuery } from 'react-responsive'; // ✅ Import agregado
import HamburguerMenu from './HamburguerMenu';
import UserDropdown from './UserDropdown';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isMobile = useMediaQuery({ maxWidth: 767 }); // ✅ Detectar móvil
    const [isScrolled, setIsScrolled] = useState(false);

    // ✅ Framer Motion scroll tracking - SIEMPRE llamar hooks
    const { scrollY } = useScroll();

    // ✅ OPTIMIZACIÓN: Rangos más cortos en móvil para mejor performance
    const scrollRange = isMobile ? [0, 150] : [0, 300];

    const backgroundOpacity = useTransform(scrollY, scrollRange, [0, 0.35]);
    const backdropBlur = useTransform(scrollY, scrollRange, [0, 10]);

    // ✅ Convertir MotionValues a strings para uso condicional
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

        window.addEventListener('scroll', handleScroll, { passive: true }); // ✅ Passive listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Link hover variants
    const linkVariants = {
        initial: { scale: 1, y: 0 },
        hover: {
            scale: 1.05,
            y: -2,
            transition: { type: 'spring', stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    // ✅ OPTIMIZACIÓN: Simplificar animaciones en móvil
    const linkVariantsMobile = {
        initial: { scale: 1 },
        tap: { scale: 0.95 }
    };

    const activeVariants = isMobile ? linkVariantsMobile : linkVariants;

    // Determinar color de texto basado en ruta y scroll
    const getLinkColor = () => {
        if (isHome) {
            return isScrolled ? '#efefef' : '#010101'; // Blanco al scrollear, negro al inicio
        }
        return '#efefef'; // Siempre blanco en otras páginas
    };

    return (
        <motion.nav
            style={{
                backgroundColor: isHome ? backgroundColor : 'rgba(26, 26, 26, 0.35)',
                backdropFilter: isHome ? backdropFilterValue : 'blur(12px)',
                WebkitBackdropFilter: isHome ? backdropFilterValue : 'blur(12px)',
            }}
            className="flex h-16 w-full fixed z-50 justify-center items-center"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            id='navbar'
        >
            <div className="nav-container">
                <motion.div
                    className="logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img className='logo-image' src={logo} alt="Logo" />
                </motion.div>

                {/* Navigation Links */}
                <div className="nav-links md:flex hidden">
                    <motion.div
                        variants={activeVariants}
                        initial="initial"
                        whileHover={isMobile ? undefined : "hover"}
                        whileTap="tap"
                    >
                        <NavLink
                            to="/"
                            style={{ color: getLinkColor() }}
                        >
                            Inicio
                        </NavLink>
                    </motion.div>

                    <motion.div
                        variants={activeVariants}
                        initial="initial"
                        whileHover={isMobile ? undefined : "hover"}
                        whileTap="tap"
                    >
                        <NavLink
                            to="/info"
                            style={{ color: getLinkColor() }}
                        >
                            Información
                        </NavLink>
                    </motion.div>

                    <motion.div
                        variants={activeVariants}
                        initial="initial"
                        whileHover={isMobile ? undefined : "hover"}
                        whileTap="tap"
                    >
                        <NavLink
                            to="/reservations"
                            style={{ color: getLinkColor() }}
                        >
                            Reservas
                        </NavLink>
                    </motion.div>

                    {user?.role === 'admin' && (
                        <motion.div
                            variants={activeVariants}
                            initial="initial"
                            whileHover={isMobile ? undefined : "hover"}
                            whileTap="tap"
                        >
                            <NavLink
                                to="/system"
                                style={{ color: getLinkColor() }}
                            >
                                Sistema
                            </NavLink>
                        </motion.div>
                    )}
                </div>

                <div className="nav-buttons">
                    {user ? (
                        <div className="md:flex hidden">
                            <UserDropdown />
                        </div>
                    ) : (
                        <div className="md:flex hidden" />
                    )}
                </div>
            </div>
            <HamburguerMenu />
        </motion.nav>
    );
};

export { NavBar }
import logo from '/assets/images/logoland.webp';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserDropdown from './UserDropdown';
import { useAuth } from '../../context/AuthContext';
import { useScroll as useScrollHook } from '../../hooks/useScroll';

const NavBarDesktop = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';

    // ✅ Hook centralizado para scroll state
    const { isScrolled } = useScrollHook(50);

    // Framer Motion scroll tracking
    const { scrollY } = useScroll();
    const scrollRange = [0, 300];

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

    // Determinar color de texto basado en ruta y scroll
    const getLinkColor = () => {
        if (isHome) {
            return isScrolled ? '#efefef' : '#010101';
        }
        return '#efefef';
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
            id='navbar-desktop'
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
                <div className="nav-links flex">
                    <motion.div
                        variants={linkVariants}
                        initial="initial"
                        whileHover="hover"
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
                        variants={linkVariants}
                        initial="initial"
                        whileHover="hover"
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
                        variants={linkVariants}
                        initial="initial"
                        whileHover="hover"
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
                            variants={linkVariants}
                            initial="initial"
                            whileHover="hover"
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
                        <div className="flex">
                            <UserDropdown />
                        </div>
                    ) : (
                        <div className="flex" />
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default NavBarDesktop;

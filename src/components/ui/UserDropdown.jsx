import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleProfileClick = () => {
        setIsOpen(false);
        navigate('/profile');
    };

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        navigate('/');
    };

    // Obtener inicial del nombre
    const getInitial = () => {
        return user?.username?.charAt(0)?.toUpperCase() ||
            user?.displayName?.charAt(0)?.toUpperCase() ||
            'U';
    };

    // ✅ FRAMER MOTION VARIANTS
    const dropdownVariants = {
        hidden: {
            opacity: 0,
            scale: 0.85,
            y: -20,
            filter: 'blur(10px)',
            transition: {
                duration: 0.2,
                ease: [0.4, 0, 1, 1], // easeIn
            }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.3,
                ease: [0, 0, 0.2, 1], // easeOut
            }
        },
        exit: {
            opacity: 0,
            scale: 0.85,
            y: -20,
            filter: 'blur(10px)',
            transition: {
                duration: 0.2,
                ease: [0.4, 0, 1, 1], // easeIn
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.2,
            }
        })
    };

    const avatarVariants = {
        idle: { scale: 1 },
        hover: {
            scale: 1.1,
            transition: { type: 'spring', stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Avatar Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="relative group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black rounded-full"
                aria-label="Menú de usuario"
                aria-expanded={isOpen}
                variants={avatarVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
            >
                {/* Glow effect al hover */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#010101da] to-gray-600 opacity-0"
                    animate={{ opacity: isOpen ? 0.6 : 0 }}
                    whileHover={{ opacity: 0.6 }}
                    style={{ filter: 'blur(8px)' }}
                    transition={{ duration: 0.3 }}
                />

                {/* Avatar */}
                <div className="relative">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'Usuario'}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                            }}
                            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                        />
                    ) : null}
                    {/* Avatar inicial del botón - fondo azul/cyan degradado */}
                    <div
                        style={{ display: user?.photoURL ? 'none' : 'flex' }}
                        className="w-10 h-10 rounded-full border-2 border-blue-500 bg-gradient-to-br from-[#010101da] to-gray-600 items-center justify-center"
                    >
                        <span className="text-white text-sm font-bold">
                            {getInitial()}
                        </span>
                    </div>
                </div>

                {/* Indicador de estado online */}
                <motion.div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
            </motion.button>

            {/* Dropdown Menu con AnimatePresence */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-3 w-72 bg-gray-900/95 rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-[100]"
                        style={{ transformOrigin: 'top right' }}
                    >
                        {/* Header con info del usuario */}
                        <motion.div
                            className="p-4 bg-gradient-to-r from-gray-900/20 to-gray-600/10 border-b border-white/10"
                            custom={0}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar en el dropdown */}
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                        className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                                    />
                                ) : null}
                                {/* Avatar inicial en el dropdown - fondo azul/cyan degradado */}
                                <div
                                    style={{ display: user?.photoURL ? 'none' : 'flex' }}
                                    className="w-12 h-12 rounded-full border-2 border-blue-500 bg-gradient-to-br from-[#010101da] to-gray-600 items-center justify-center"
                                >
                                    <span className="text-white text-lg font-bold">
                                        {getInitial()}
                                    </span>
                                </div>

                                {/* Info del usuario */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {user?.username || user?.displayName || 'Usuario'}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                        {user?.email}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {/* Indicador de rol - azul para usuarios, amarillo para admin */}
                                        <motion.div
                                            className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-yellow-500' : 'bg-gray-500'}`}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        />
                                        <span className="text-xs text-gray-400">
                                            {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {/* Perfil */}
                            <motion.button
                                onClick={handleProfileClick}
                                className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200"
                                custom={1}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Icono del botón de perfil - fondo azul */}
                                <motion.div
                                    className="w-8 h-8 rounded-lg bg-gray-600/50 flex items-center justify-center"
                                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)' }}
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </motion.div>
                                <div className="flex-1 text-left">
                                    <p className="text-white text-sm font-medium">Mi Perfil</p>
                                    <p className="text-gray-400 text-xs">Ver y editar información</p>
                                </div>
                                <motion.svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </motion.svg>
                            </motion.button>

                            {/* Divider */}
                            <motion.div
                                className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                custom={2}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                            />

                            {/* Cerrar Sesión */}
                            <motion.button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 flex items-center gap-3 transition-colors duration-200"
                                custom={3}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="w-8 h-8 rounded-lg bg-red-600/50 flex items-center justify-center"
                                    whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.7)' }}
                                >
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </motion.div>
                                <div className="flex-1 text-left">
                                    <p className="text-red-400 text-sm font-medium">Cerrar Sesión</p>
                                    <p className="text-gray-400 text-xs">Salir de tu cuenta</p>
                                </div>
                            </motion.button>
                        </div>

                        {/* Footer con versión */}
                        <motion.div
                            className="px-4 py-2 border-t border-white/10 bg-black/30"
                            custom={4}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <p className="text-center text-xs text-gray-500">
                                Hadouken Dojo v0.5
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDropdown;

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Animar cuando isOpen cambia
    useLayoutEffect(() => {
        if (isOpen && menuRef.current) {
            // Animación de apertura
            gsap.fromTo(menuRef.current,
                {
                    opacity: 0,
                    y: -10,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                }
            );
        }
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen) {
            setIsOpen(true);
        } else {
            closeDropdown();
        }
    };

    const closeDropdown = () => {
        if (menuRef.current) {
            gsap.to(menuRef.current, {
                opacity: 0,
                y: -10,
                scale: 0.95,
                duration: 0.15,
                ease: 'power2.in',
                onComplete: () => setIsOpen(false)
            });
        } else {
            setIsOpen(false);
        }
    };

    const handleProfileClick = () => {
        closeDropdown();
        navigate('/profile');
    };

    const handleLogout = async () => {
        closeDropdown();
        await logout();
        navigate('/');
    };

    // Obtener inicial del nombre
    const getInitial = () => {
        return user?.username?.charAt(0)?.toUpperCase() ||
            user?.displayName?.charAt(0)?.toUpperCase() ||
            'U';
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Avatar Button */}
            <button
                onClick={toggleDropdown}
                className="relative group focus:outline-none"
                aria-label="Menú de usuario"
            >
                {/* Ring de animación al hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-red to-light-red opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />

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
                            className="w-10 h-10 rounded-full border-2 border-light-red object-cover transition-transform duration-300 group-hover:scale-110 group-hover:border-white"
                        />
                    ) : null}
                    <div
                        style={{ display: user?.photoURL ? 'none' : 'flex' }}
                        className="w-10 h-10 rounded-full border-2 border-light-red bg-gradient-to-br from-dark-red to-light-red items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:border-white"
                    >
                        <span className="text-white text-sm font-bold">
                            {getInitial()}
                        </span>
                    </div>
                </div>

                {/* Indicador de estado online */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute right-0 mt-3 w-64 glass-container rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    style={{ opacity: 0 }}
                >
                    {/* Header con info del usuario */}
                    <div className="p-4 bg-gradient-to-r from-dark-red/30 to-light-red/30 border-b border-white/10">
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
                                    className="w-12 h-12 rounded-full border-2 border-light-red object-cover"
                                />
                            ) : null}
                            <div
                                style={{ display: user?.photoURL ? 'none' : 'flex' }}
                                className="w-12 h-12 rounded-full border-2 border-light-red bg-gradient-to-br from-dark-red to-light-red items-center justify-center"
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
                                <p className="text-gray text-xs truncate">
                                    {user?.email}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-xs text-gray">
                                        {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* Perfil */}
                        <button
                            onClick={handleProfileClick}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-dark-blue/50 flex items-center justify-center group-hover:bg-light-blue/30 transition-colors">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-white text-sm font-medium">Mi Perfil</p>
                                <p className="text-gray text-xs">Ver y editar información</p>
                            </div>
                            <svg className="w-4 h-4 text-gray group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Cerrar Sesión */}
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-light-red/10 transition-colors duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-dark-red/50 flex items-center justify-center group-hover:bg-light-red/30 transition-colors">
                                <svg className="w-5 h-5 text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-light-red text-sm font-medium">Cerrar Sesión</p>
                                <p className="text-gray text-xs">Salir de tu cuenta</p>
                            </div>
                        </button>
                    </div>

                    {/* Footer con versión */}
                    <div className="px-4 py-2 border-t border-white/10 bg-black/20">
                        <p className="text-center text-xs text-gray">
                            Hadouken Dojo v0.5
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;

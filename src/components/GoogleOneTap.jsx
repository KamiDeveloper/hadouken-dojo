import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * GoogleOneTap - Componente inteligente para autenticación rápida con Google
 * 
 * Features:
 * - Smart Timing: Se muestra después de 3 segundos o 30% de scroll
 * - Rutas inteligentes: Solo en rutas públicas (/, /info)
 * - Una vez por sesión: localStorage tracking
 * - Auto-hide: Desaparece después de 8 segundos si no hay interacción
 * - Personalización: Logo y mensaje custom del dojo
 */
const GoogleOneTap = () => {
    const { user, loginWithGoogle } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [shouldShow, setShouldShow] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const timeoutRef = useRef(null);
    const autoHideRef = useRef(null);

    // Rutas donde se permite mostrar One Tap
    const allowedRoutes = ['/', '/info'];

    // Verificar si estamos en una ruta permitida
    const isAllowedRoute = allowedRoutes.includes(location.pathname);

    // Storage keys para tracking
    const STORAGE_KEY = 'google_one_tap_shown';
    const STORAGE_DISMISSED_KEY = 'google_one_tap_dismissed';

    // Verificar si ya se mostró en esta sesión
    const hasShownThisSession = () => {
        return sessionStorage.getItem(STORAGE_KEY) === 'true';
    };

    // Verificar si usuario lo descartó recientemente (24h)
    const wasRecentlyDismissed = () => {
        const dismissedTime = localStorage.getItem(STORAGE_DISMISSED_KEY);
        if (!dismissedTime) return false;

        const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
        return hoursSinceDismissed < 24;
    };

    // Marcar como mostrado
    const markAsShown = () => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
    };

    // Marcar como descartado
    const markAsDismissed = () => {
        localStorage.setItem(STORAGE_DISMISSED_KEY, Date.now().toString());
    };

    // Detectar scroll (30% de la página)
    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 30 && !hasScrolled) {
                setHasScrolled(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolled]);

    // Lógica de Smart Timing
    useEffect(() => {
        // No mostrar si:
        // - Usuario ya autenticado
        // - No es ruta permitida
        // - Ya se mostró esta sesión
        // - Usuario lo descartó recientemente
        if (user || !isAllowedRoute || hasShownThisSession() || wasRecentlyDismissed()) {
            return;
        }

        // Smart Timing: Esperar 3 segundos O 30% de scroll (lo que ocurra primero)
        if (hasScrolled && !shouldShow) {
            // Ya scrolleó 30%, mostrar inmediatamente
            setShouldShow(true);
            markAsShown();

            // Auto-hide después de 8 segundos
            autoHideRef.current = setTimeout(() => {
                setShouldShow(false);
            }, 8000);
        } else if (!timeoutRef.current) {
            // Esperar 3 segundos antes de mostrar
            timeoutRef.current = setTimeout(() => {
                setShouldShow(true);
                markAsShown();

                // Auto-hide después de 8 segundos
                autoHideRef.current = setTimeout(() => {
                    setShouldShow(false);
                }, 8000);
            }, 3000);
        }

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (autoHideRef.current) {
                clearTimeout(autoHideRef.current);
                autoHideRef.current = null;
            }
        };
    }, [user, isAllowedRoute, hasScrolled, shouldShow]);

    // Manejar clic en el banner para iniciar sesión con Google
    const handleGoogleLogin = async () => {
        try {
            // Mostrar loading toast
            const loadingToast = toast.loading('Iniciando sesión con Google...');

            // Llamar al método de login existente
            const result = await loginWithGoogle();

            // Cerrar loading toast
            toast.dismiss(loadingToast);

            if (result?.needsProfileCompletion) {
                toast.success('¡Bienvenido! Completa tu perfil para continuar', {
                    duration: 4000,
                });
                // El modal se mostrará automáticamente
            } else {
                toast.success('¡Bienvenido de nuevo!', {
                    duration: 3000,
                });

                // Redirigir según rol
                if (result?.role === 'admin') {
                    navigate('/system');
                } else {
                    navigate('/reservations');
                }
            }

            setShouldShow(false);
            markAsShown();
        } catch (error) {
            console.error('Error en Google One Tap:', error);

            // Mensaje de error más específico
            const errorMessage = error.code === 'auth/popup-closed-by-user'
                ? 'Inicio de sesión cancelado'
                : 'Error al iniciar sesión con Google';

            toast.error(errorMessage, {
                duration: 3000,
            });
        }
    };

    // Manejar cierre del banner
    const handleDismiss = (e) => {
        e.stopPropagation();
        setShouldShow(false);
        markAsDismissed();
        toast('Puedes iniciar sesión desde el menú', {
            duration: 2000,
        });
    };

    // Mostrar banner si debe mostrarse
    if (!shouldShow) return null;

    return (
        <>
            {/* Banner inteligente con botón de Google */}
            <div
                className="fixed top-4 right-4 z-[9998] pointer-events-auto"
                style={{
                    animation: 'fadeInSlide 0.5s ease-out',
                }}
            >
                <div className="bg-gradient-to-r from-red-950 to-black text-white rounded-xl shadow-2xl max-w-sm overflow-hidden">
                    {/* Header con botón de cerrar */}
                    <div className="relative px-4 py-3 border-b border-white/20">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Cerrar"
                        >
                            <span className="text-white text-lg leading-none">×</span>
                        </button>
                        <div className="flex items-center gap-3 pr-6">
                            <img
                                src="/assets/images/logoland.webp"
                                alt="Hadouken Dojo Logo"
                                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            />
                            <div>
                                <p className="text-sm font-bold">Hadouken Dojo</p>
                                <p className="text-xs opacity-90 mt-0.5">Tu camino a lo más alto comienza aquí</p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido con CTA */}
                    <div className="px-4 py-3">
                        <p className="text-sm mb-3">
                            Accede en segundos con tu cuenta de Google
                        </p>

                        {/* Botón de Google estilizado */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continuar con Google</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Estilos para la animación */}
            <style>{`
                @keyframes fadeInSlide {
                    from {
                        opacity: 0;
                        transform: translateX(20px) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default GoogleOneTap;

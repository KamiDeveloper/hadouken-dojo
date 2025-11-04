import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Reservations = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const hasChecked = useRef(false);

    // Sistema de validación optimizado con caché en sessionStorage
    useEffect(() => {
        // Evitar múltiples verificaciones
        if (hasChecked.current) return;

        const checkUserProfile = async () => {
            // Si no hay usuario y ya terminó de cargar, redirigir a login
            if (!loading && !user) {
                toast.error('Debes iniciar sesión para hacer reservas');
                navigate('/acceder', { state: { from: { pathname: '/reservations' } } });
                return;
            }

            // Si el usuario está cargando, esperar
            if (loading) {
                return;
            }

            // Verificar caché en sessionStorage (válido por sesión)
            const cachedValidation = sessionStorage.getItem(`profile_validated_${user?.uid}`);
            if (cachedValidation === 'true') {
                setIsCheckingProfile(false);
                hasChecked.current = true;
                return;
            }

            // Verificar si el usuario tiene username
            if (user && !user.username) {
                // El modal se mostrará automáticamente desde RootLayout
                toast.error('Completa tu perfil para hacer reservas', {
                    duration: 4000,
                    id: 'complete-profile-required'
                });
                setIsCheckingProfile(false);
                hasChecked.current = true;
                return;
            }

            // Usuario válido, guardar en caché
            if (user?.username) {
                sessionStorage.setItem(`profile_validated_${user.uid}`, 'true');
                setIsCheckingProfile(false);
                hasChecked.current = true;
            }
        };

        checkUserProfile();
    }, [user, loading, navigate]);

    // Limpiar caché cuando el usuario cierra sesión
    useEffect(() => {
        if (!user && hasChecked.current) {
            sessionStorage.removeItem(`profile_validated_${user?.uid}`);
            hasChecked.current = false;
        }
    }, [user]);

    if (loading || isCheckingProfile) {
        return (
            <div className='proximamente'>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-light-red border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray">Verificando perfil...</p>
                </div>
            </div>
        );
    }

    // Si el usuario no tiene username, mostrar mensaje
    if (user && !user.username) {
        return (
            <div className='proximamente'>
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-6">
                        <svg className="w-20 h-20 mx-auto text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gradient" style={{ fontFamily: 'var(--font-modern-negra)' }}>
                        Perfil Incompleto
                    </h2>
                    <p className="text-gray text-lg mb-6">
                        Necesitas completar tu perfil antes de hacer reservas
                    </p>
                    <div className="glass-container rounded-2xl p-6 border border-white/10">
                        <p className="text-white/70 text-sm">
                            El modal de completar perfil debería aparecer automáticamente. Si no lo ves, intenta recargar la página.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='proximamente'>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold mb-4 text-gradient" style={{ fontFamily: 'var(--font-modern-negra)' }}>
                    Sistema de Reservas
                </h1>
                <p className="text-xl text-gray mb-8">
                    Bienvenido, <span className="text-light-red font-semibold uppercase" style={{ fontFamily: 'var(--font-tarrget-italic)' }}>{user?.username}</span>
                </p>

                <div className="glass-container rounded-3xl p-8 border border-white/10">
                    <p className="text-white/70 text-lg">
                        El sistema de reservas estará disponible próximamente...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reservations;

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const completeProfileSchema = z.object({
    username: z.string()
        .min(3, 'Mínimo 3 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    phone: z.string().optional(),
});

const CompleteProfileModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const { user, completeProfile } = useAuth();
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(completeProfileSchema),
        mode: 'onBlur',
        defaultValues: {
            username: '',
            phone: ''
        }
    });

    const username = watch('username');

    // Cache de usernames verificados para evitar consultas repetidas
    const usernameCache = useRef(new Map());
    const checkTimeoutRef = useRef(null);

    // Animación de entrada del modal
    useEffect(() => {
        if (isOpen && modalRef.current && contentRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(contentRef.current,
                { scale: 0.9, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)', delay: 0.1 }
            );
        }
    }, [isOpen]);

    // Verificar disponibilidad de username con debounce y caché
    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        // Limpiar timeout anterior
        if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current);
        }

        // Verificar caché primero
        if (usernameCache.current.has(username.toLowerCase())) {
            setUsernameAvailable(usernameCache.current.get(username.toLowerCase()));
            return;
        }

        // Debounce de 500ms
        checkTimeoutRef.current = setTimeout(async () => {
            setIsCheckingUsername(true);
            try {
                const usersRef = collection(db, 'users');
                const q = query(
                    usersRef,
                    where('username', '==', username.toLowerCase()),
                    limit(1) // ✅ Agregar limit para cumplir con Firestore Rules
                );
                const snapshot = await getDocs(q);

                const available = snapshot.empty;

                // Guardar en caché
                usernameCache.current.set(username.toLowerCase(), available);

                setUsernameAvailable(available);
            } catch (error) {
                console.error('Error verificando username:', error);
                setUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500);

        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }
        };
    }, [username]);

    const onSubmit = async (data) => {
        if (!usernameAvailable) {
            toast.error('Por favor elige un nombre de usuario disponible');
            return;
        }

        setIsLoading(true);
        try {
            await completeProfile(data);
            toast.success('¡Perfil completado exitosamente!');

            // Limpiar caché
            usernameCache.current.clear();

            // Cerrar modal con animación
            if (modalRef.current && contentRef.current) {
                gsap.to(contentRef.current, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in'
                });
                gsap.to(modalRef.current, {
                    opacity: 0,
                    duration: 0.2,
                    delay: 0.2,
                    onComplete: onClose
                });
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error completando perfil:', error);

            if (error.message?.includes('username already exists')) {
                toast.error('Este nombre de usuario ya está en uso');
                // Actualizar caché
                usernameCache.current.set(username.toLowerCase(), false);
                setUsernameAvailable(false);
            } else {
                toast.error('Error al completar el perfil');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user?.needsProfileCompletion) return null;

    // Obtener inicial del nombre
    const getInitial = () => {
        return user.displayName ? user.displayName.charAt(0).toUpperCase() : '?';
    };

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            style={{ opacity: 0 }}
        >
            <div
                ref={contentRef}
                className="w-full max-w-md glass-container rounded-3xl p-8 border border-white/10 shadow-2xl"
                style={{ opacity: 0 }}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    {/* Foto de perfil o inicial */}
                    <div className="mb-4 flex justify-center">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-20 h-20 rounded-full border-2 border-light-red shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-dark-red to-light-red flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                            style={{ display: user.photoURL ? 'none' : 'flex' }}
                        >
                            {getInitial()}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-tarrget)' }}>
                        ¡Bienvenido!
                    </h2>
                    <p className="text-gray text-sm">
                        {user.displayName || user.email}
                    </p>
                    <p className="text-white/70 text-sm mt-2">
                        Completa tu perfil para continuar
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                            Nombre de Usuario <span className="text-light-red">*</span>
                        </label>
                        <div className="relative">
                            <input
                                {...register('username')}
                                type="text"
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all pr-10"
                                placeholder="usuario123"
                                autoComplete="off"
                            />
                            {/* Indicador de verificación */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isCheckingUsername && (
                                    <div className="w-5 h-5 border-2 border-light-red border-t-transparent rounded-full animate-spin" />
                                )}
                                {!isCheckingUsername && usernameAvailable === true && (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {!isCheckingUsername && usernameAvailable === false && (
                                    <svg className="w-5 h-5 text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        {errors.username && (
                            <p className="text-light-red text-xs mt-1">{errors.username.message}</p>
                        )}
                        {!errors.username && usernameAvailable === false && (
                            <p className="text-light-red text-xs mt-1">Este nombre de usuario no está disponible</p>
                        )}
                        {!errors.username && usernameAvailable === true && (
                            <p className="text-green-500 text-xs mt-1">¡Nombre de usuario disponible!</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray mb-2">
                            Teléfono (Opcional)
                        </label>
                        <input
                            {...register('phone')}
                            type="tel"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                            placeholder="1234-5678"
                        />
                        {errors.phone && (
                            <p className="text-light-red text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isCheckingUsername || usernameAvailable !== true}
                        className="w-full py-3 px-4 bg-gradient-to-r from-dark-red to-light-red text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-light-red/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? 'Guardando...' : 'Completar Perfil'}
                    </button>
                </form>

                {/* Nota importante */}
                <div className="mt-6 p-4 bg-dark-blue/30 border border-light-blue/30 rounded-xl">
                    <p className="text-xs text-white/70 text-center">
                        <span className="text-light-red font-semibold">Importante:</span> Necesitas completar tu perfil para hacer reservas
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfileModal;

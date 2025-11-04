import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import gsap from 'gsap';

// Schemas de validación
const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const signupSchema = z.object({
    displayName: z.string().min(2, 'Mínimo 2 caracteres'),
    username: z.string()
        .min(3, 'Mínimo 3 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

const Acceder = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithEmail, signupWithEmail, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Refs para animaciones
    const containerRef = useRef(null);
    const tabIndicatorRef = useRef(null);
    const formRef = useRef(null);

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (user && !user.needsProfileCompletion) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    // Animación de entrada
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, []);

    // Animación al cambiar tabs
    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current,
                { opacity: 0, x: activeTab === 'login' ? -20 : 20 },
                { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [activeTab]);

    // Forms
    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur'
    });

    const signupForm = useForm({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur'
    });

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            // Animar indicador
            gsap.to(tabIndicatorRef.current, {
                x: tab === 'login' ? 0 : '100%',
                duration: 0.3,
                ease: 'power2.inOut'
            });
            setActiveTab(tab);
        }
    };

    const onLoginSubmit = async (data) => {
        setIsLoading(true);
        try {
            const result = await loginWithEmail(data.email, data.password);

            if (result.needsProfileCompletion) {
                toast.success('Por favor completa tu perfil');
                return;
            }

            toast.success('¡Bienvenido de nuevo!');
            const from = location.state?.from?.pathname || (result.role === 'admin' ? '/SystemManagement' : '/reservations');
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Error en login:', error);
            let errorMessage = 'Error al iniciar sesión';

            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Email o contraseña incorrectos';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuario no encontrado';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Contraseña incorrecta';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Demasiados intentos. Intenta más tarde';
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onSignupSubmit = async (data) => {
        setIsLoading(true);
        try {
            await signupWithEmail(data);
            toast.success('¡Cuenta creada exitosamente!');

            // Cambiar a tab de login
            handleTabChange('login');
            loginForm.reset();
        } catch (error) {
            console.error('Error en registro:', error);
            let errorMessage = 'Error al crear cuenta';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este email ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña es muy débil';
            } else if (error.message?.includes('username')) {
                errorMessage = 'Este nombre de usuario ya está en uso';
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await loginWithGoogle();

            if (result.needsProfileCompletion) {
                toast.success('¡Casi listo! Completa tu perfil');
                return;
            }

            toast.success('¡Bienvenido!');
            const from = location.state?.from?.pathname || (result.role === 'admin' ? '/SystemManagement' : '/reservations');
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Error en Google login:', error);
            toast.error('Error al iniciar con Google');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-20 relative overflow-hidden bg-linear-to-br from-[var(--color-dark-red)] to-[var(--color-dark-blue)]" >
            {/* Fondo con gradiente radial */}
            <div className="fixed inset-0" />

            <div ref={containerRef} className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/assets/images/biglogo.webp"
                        alt="Hadouken Dojo"
                        className="w-48 mx-auto mb-4 opacity-90"
                    />
                    <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-tarrget)' }}>
                        Acceder
                    </h1>
                    <p className="text-gray text-sm">
                        {activeTab === 'login' ? 'Bienvenido de nuevo' : 'Únete a la comunidad'}
                    </p>
                </div>

                {/* Contenedor con glassmorphism */}
                <div className="glass-container rounded-3xl p-8 border border-white/10 shadow-2xl">
                    {/* Tabs */}
                    <div className="relative mb-8">
                        <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-2xl p-1 relative">
                            {/* Indicador animado */}
                            <div
                                ref={tabIndicatorRef}
                                className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-gradient-to-r from-dark-red to-light-red rounded-xl transition-transform"
                                style={{ left: '0.25rem' }}
                            />

                            <button
                                onClick={() => handleTabChange('login')}
                                className={`relative z-10 py-3 px-6 rounded-xl font-semibold transition-colors duration-300 ${activeTab === 'login' ? 'text-white' : 'text-gray hover:text-white'
                                    }`}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => handleTabChange('signup')}
                                className={`relative z-10 py-3 px-6 rounded-xl font-semibold transition-colors duration-300 ${activeTab === 'signup' ? 'text-white' : 'text-gray hover:text-white'
                                    }`}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>

                    {/* Botón de Google (compartido) */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continuar con Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-6">
                        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray/50 to-transparent" />
                        <span className="relative bg-black/60 px-4 text-gray text-sm">o continuar con email</span>
                    </div>

                    {/* Formularios */}
                    <div ref={formRef}>
                        {activeTab === 'login' ? (
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Email
                                    </label>
                                    <input
                                        {...loginForm.register('email')}
                                        type="email"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="tu@email.com"
                                    />
                                    {loginForm.formState.errors.email && (
                                        <p className="text-light-red text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        {...loginForm.register('password')}
                                        type="password"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                    {loginForm.formState.errors.password && (
                                        <p className="text-light-red text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-dark-red to-light-red text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-light-red/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Nombre Completo
                                    </label>
                                    <input
                                        {...signupForm.register('displayName')}
                                        type="text"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="Juan Pérez"
                                    />
                                    {signupForm.formState.errors.displayName && (
                                        <p className="text-light-red text-xs mt-1">{signupForm.formState.errors.displayName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Nombre de Usuario
                                    </label>
                                    <input
                                        {...signupForm.register('username')}
                                        type="text"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="usuario123"
                                    />
                                    {signupForm.formState.errors.username && (
                                        <p className="text-light-red text-xs mt-1">{signupForm.formState.errors.username.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Email
                                    </label>
                                    <input
                                        {...signupForm.register('email')}
                                        type="email"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="tu@email.com"
                                    />
                                    {signupForm.formState.errors.email && (
                                        <p className="text-light-red text-xs mt-1">{signupForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        {...signupForm.register('password')}
                                        type="password"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                    {signupForm.formState.errors.password && (
                                        <p className="text-light-red text-xs mt-1">{signupForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        {...signupForm.register('confirmPassword')}
                                        type="password"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray/50 focus:outline-none focus:border-light-red focus:ring-2 focus:ring-light-red/20 transition-all"
                                        placeholder="••••••••"
                                    />
                                    {signupForm.formState.errors.confirmPassword && (
                                        <p className="text-light-red text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-dark-red to-light-red text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-light-red/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Acceder;

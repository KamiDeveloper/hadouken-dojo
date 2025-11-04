import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Validación del formulario
const completeProfileSchema = z.object({
    username: z
        .string()
        .min(3, 'El nickname debe tener al menos 3 caracteres')
        .max(20, 'El nickname no puede tener más de 20 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[0-9]{8}$/.test(val),
            'El teléfono debe tener 8 dígitos'
        ),
});

export default function CompleteRegistration() {
    const { user, completeProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: {
            username: '',
            phone: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await completeProfile(data.username, data.phone);
            toast.success('¡Perfil completado exitosamente!');

            // Redirigir según el rol
            if (user?.role === 'admin') {
                navigate('/SystemManagement');
            } else {
                navigate('/reservations');
            }
        } catch (error) {
            console.error('Error completando perfil:', error);
            toast.error(error.message || 'Error al completar el perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-10 h-10 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            ¡Casi listo!
                        </h2>
                        <p className="text-gray-300">
                            Completa tu perfil para continuar
                        </p>
                    </div>

                    {/* Datos pre-llenados */}
                    <div className="mb-6 space-y-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Nombre</p>
                            <p className="text-white font-medium">{user?.displayName || 'Usuario'}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Email</p>
                            <p className="text-white font-medium">{user?.email}</p>
                        </div>
                        {user?.photoURL && (
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-2">Foto de perfil</p>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.photoURL}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            // Si la imagen falla (AdBlocker), mostrar iniciales
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                        className="w-16 h-16 rounded-full border-2 border-purple-500 object-cover"
                                    />
                                    <div
                                        style={{ display: 'none' }}
                                        className="w-16 h-16 rounded-full border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 items-center justify-center"
                                    >
                                        <span className="text-white text-xl font-bold">
                                            {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{user?.displayName}</p>
                                        <p className="text-gray-400 text-xs">Desde Google</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                                Nickname <span className="text-red-400">*</span>
                            </label>
                            <input
                                {...register('username')}
                                type="text"
                                id="username"
                                placeholder="tu_nickname_aqui"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">
                                Este será tu identificador único en la plataforma
                            </p>
                        </div>

                        {/* Phone (opcional) */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                                Teléfono <span className="text-gray-400">(opcional)</span>
                            </label>
                            <input
                                {...register('phone')}
                                type="tel"
                                id="phone"
                                placeholder="1234567890"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Completando...
                                </span>
                            ) : (
                                'Completar Registro'
                            )}
                        </button>
                    </form>

                    {/* Info adicional */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            Al completar el registro, aceptas nuestros términos y condiciones
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

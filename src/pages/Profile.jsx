import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Profile = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/getstarted');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );
        }
    }, []);

    if (loading) {
        return (
            <div className='proximamente'>
                <div className="w-16 h-16 border-4 border-light-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const getInitial = () => {
        return user?.username?.charAt(0)?.toUpperCase() ||
            user?.displayName?.charAt(0)?.toUpperCase() ||
            'U';
    };

    return (
        <div className='proximamente'>
            <div ref={containerRef} className="max-w-4xl mx-auto px-4" style={{ opacity: 0 }}>
                {/* Header con foto de perfil */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-6">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || 'Usuario'}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                                className="w-32 h-32 rounded-full border-4 border-light-red object-cover shadow-2xl"
                            />
                        ) : null}
                        <div
                            style={{ display: user.photoURL ? 'none' : 'flex' }}
                            className="w-32 h-32 rounded-full border-4 border-light-red bg-gradient-to-br from-dark-red to-light-red items-center justify-center shadow-2xl"
                        >
                            <span className="text-white text-5xl font-bold">
                                {getInitial()}
                            </span>
                        </div>

                        {/* Badge de rol */}
                        <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-dark-red to-light-red text-white text-xs font-semibold shadow-lg">
                            {user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-2 text-gradient" style={{ fontFamily: 'var(--font-tarrget)' }}>
                        {user.username || user.displayName || 'Usuario'}
                    </h1>
                    <p className="text-gray text-lg">{user.email}</p>
                </div>

                {/* Grid de información */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Card de información básica */}
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Información Personal
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Nombre</span>
                                <span className="text-white font-medium">{user.displayName || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Usuario</span>
                                <span className="text-white font-medium">@{user.username || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Email</span>
                                <span className="text-white font-medium text-sm truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray text-sm">Teléfono</span>
                                <span className="text-white font-medium">{user.phone || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card de estadísticas */}
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Estadísticas
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Reservas Totales</span>
                                <span className="text-white font-bold text-lg">0</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Strikes</span>
                                <span className={`font-bold text-lg ${user.strikes > 0 ? 'text-light-red' : 'text-green-500'}`}>
                                    {user.strikes || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-gray text-sm">Estado</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.bannedUntil ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                    {user.bannedUntil ? 'Baneado' : 'Activo'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray text-sm">Miembro desde</span>
                                <span className="text-white font-medium text-sm">
                                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Próximamente */}
                <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10 text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Edición de Perfil</h3>
                    <p className="text-gray">
                        La función de editar perfil estará disponible próximamente
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;

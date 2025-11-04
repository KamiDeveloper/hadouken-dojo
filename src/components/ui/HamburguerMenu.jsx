import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useAuth } from '../../context/AuthContext'

const HamburguerMenu = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useGSAP(() => {
        const menuTween = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "+=700 top top",
                end: "+=300",
                scrub: true,
            }
        })
        menuTween
            .to('.mobile-menu-img', {
                backgroundColor: 'var(--color-white)',
                borderRadius: '5px',
                duration: 0.5,
                opacity: 0.9,
                ease: 'power4.out'
            })
    }, [])

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
    };

    // Obtener inicial del nombre
    const getInitial = () => {
        return user?.username?.charAt(0)?.toUpperCase() ||
            user?.displayName?.charAt(0)?.toUpperCase() ||
            'U';
    };

    return (
        <div id="hamburger-menu" >
            <img src="/assets/icons/hamburger.svg" alt="Menu" onClick={toggleMenu} className="lg:hidden mobile-menu-img !p-1 cursor-pointer" />
            <div
                onClick={toggleMenu}
                className={`fixed lg:hidden inset-0 w-screen h-screen bg-black/60 transform ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ease-in-out z-40`}
            />
            <div
                className={`fixed lg:hidden right-0 top-0 h-screen w-[75%] max-w-[320px] bg-gradient-to-br from-black/95 via-black/90 to-black/85 backdrop-blur-xl shadow-2xl transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 border-l border-white/10 flex flex-col`}
            >
                {/* Header con perfil de usuario */}
                {user ? (
                    <div className="border-t border-white/10 p-4 space-y-2">
                        <NavLink
                            to="/profile"
                            onClick={toggleMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-white text-sm font-medium">Mi Perfil</span>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-light-red/10 transition-colors"
                        >
                            <svg className="w-5 h-5 text-light-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-light-red text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                ) : (
                    <div className="border-t border-white/10 p-4 space-y-2">
                        <NavLink
                            to="/getstarted"
                            onClick={toggleMenu}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-dark-red to-light-red rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-light-red/50 transition-all"
                        >
                            Acceder
                        </NavLink>
                    </div>
                )}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    {user ? (
                        <div className="flex items-center gap-3 w-full">
                            {/* Avatar */}
                            {user.photoURL ? (
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
                                style={{ display: user.photoURL ? 'none' : 'flex' }}
                                className="w-12 h-12 rounded-full border-2 border-light-red bg-gradient-to-br from-dark-red to-light-red items-center justify-center"
                            >
                                <span className="text-white text-lg font-bold">
                                    {getInitial()}
                                </span>
                            </div>

                            {/* Info del usuario */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">
                                    {user.username || user.displayName || 'Usuario'}
                                </p>
                                <p className="text-gray text-xs truncate">
                                    {user.email}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-xs text-gray">
                                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xl font-bold text-white uppercase tracking-wider" />
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto">
                    <ul className="nav-links-mobile">
                        <NavLink to="/" onClick={toggleMenu}>Inicio</NavLink>
                        <NavLink to="/info" onClick={toggleMenu}>Información</NavLink>
                        <NavLink to="/reservations" onClick={toggleMenu}>Reservas</NavLink>
                        <NavLink to="/system" onClick={toggleMenu}>Sistema</NavLink>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default HamburguerMenu
import logo from '/assets/images/logoland.webp'
import { NavLink, useLocation } from 'react-router-dom'
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import HamburguerMenu from './HamburguerMenu'
import UserDropdown from './UserDropdown'
import { useAuth } from '../../context/AuthContext'

const NavBar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isHome = location.pathname === '/';

    useGSAP(() => {
        const navTween = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "+=300",
                scrub: true
            }
        })
        const linkTween = gsap.timeline({
            scrollTrigger: {
                trigger: document.body,
                start: "+=700 top top",
                end: "+=300",
                scrub: true,
            }
        })

        navTween.fromTo('nav', {
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))',
            backdropFilter: 'blur(0px)'
        }, {
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            backdropFilter: 'blur(10px)',
            ease: 'power4.out',
        })

        linkTween
            .to('.nav-links a', {
                color: '#aaa',
            })

    }, [])


    return (
        <nav id='navbar'>
            <div className="nav-container ">
                <div className="logo">
                    <img className='logo-image' src={logo} alt="Logo" />
                </div>
                <div className={`nav-links md:flex hidden ${!isHome ? '!text-white' : ''}`}>
                    <NavLink to="/">Inicio</NavLink>
                    <NavLink to="/info">Información</NavLink>
                    <NavLink to="/reservations">Reservas</NavLink>
                    {user?.role === 'admin' && (
                        <NavLink to="/system">Sistema</NavLink>
                    )}
                </div>
                <div className="nav-buttons">
                    {user ? (
                        // Usuario autenticado - Mostrar dropdown solo en tablets y arriba
                        <div className="md:flex hidden">
                            <UserDropdown />
                        </div>
                    ) : (
                        // Usuario NO autenticado
                        <div className="md:flex hidden" />
                    )}
                </div>
            </div>
            <HamburguerMenu />
        </nav>
    )
}

export { NavBar }
import logo from '/assets/images/logoland.webp'
import { NavLink } from 'react-router-dom'
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import HamburguerMenu from './HamburguerMenu'
import UserDropdown from './UserDropdown'
import { useAuth } from '../context/AuthContext'
import { FlipButton } from '../components/ui/FlipButton';

const NavBar = () => {
    const { user } = useAuth();

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
                <div className="nav-links md:flex hidden">
                    <NavLink to="/">Inicio</NavLink>
                    <NavLink to="/info">Información</NavLink>
                    <NavLink to="/reservations">Reservas</NavLink>
                    <NavLink to="/system">Sistema</NavLink>
                </div>
                <div className="nav-buttons">
                    {user ? (
                        // Usuario autenticado - Mostrar dropdown
                        <UserDropdown />
                    ) : (
                        // Usuario NO autenticado
                        <NavLink to="/acceder">
                            <FlipButton
                                frontText="Acceder"
                                backText={<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path strokeDasharray="36" strokeDashoffset="36" d="M13 4l7 0c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-7"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="36;0" /></path><path strokeDasharray="14" strokeDashoffset="14" d="M3 12h11.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="14;0" /></path><path strokeDasharray="6" strokeDashoffset="6" d="M14.5 12l-3.5 -3.5M14.5 12l-3.5 3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="6;0" /></path></g></svg>}
                                from="left"
                                frontClassName="bg-[var(--color-white)] font-bold !text-[var(--color-black)]"
                                backClassName="bg-[var(--color-black)] text-[var(--color-white)]"
                            />
                        </NavLink>
                    )}
                </div>
            </div>
            <HamburguerMenu />
        </nav>
    )
}

export { NavBar }
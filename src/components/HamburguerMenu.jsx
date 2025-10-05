import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

const HamburguerMenu = () => {

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

    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }
    return (
        <div id="hamburger-menu" >
            <img src="/assets/icons/hamburger.svg" alt="Menu" onClick={toggleMenu} className="lg:hidden mobile-menu-img !p-1 cursor-pointer" />
            <div
                onClick={toggleMenu}
                className={`fixed lg:hidden inset-0 w-screen h-screen bg-black/60 transform ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 ease-in-out z-40`}
            />
            <div
                className={`fixed lg:hidden right-0 top-0 h-screen w-[75%] max-w-[320px] bg-gradient-to-br from-black/95 via-black/90 to-black/85 backdrop-blur-xl shadow-2xl transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 border-l border-white/10`}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div className="text-xl font-bold text-white uppercase tracking-wider h-17" />
                </div>
                <nav className="h-full">
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
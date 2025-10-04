import { useState } from "react"
import { NavLink } from "react-router-dom"

const HamburguerMenu = () => {

    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }
    return (
        <div id="hamburger-menu" >
            <img src="/assets/icons/hamburger.svg" alt="Menu" onClick={toggleMenu} className="lg:hidden " />
            <div className={`absolute lg:hidden right-0 top-0 h-dvh w-[60%] bg-black/90 backdrop-blur-sm shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
                <div className="flex justify-end p-4">
                    <img src="/assets/icons/close.svg" alt="close" onClick={toggleMenu} className="hm-close-button" />
                    <div>
                        <ul className="nav-links-mobile">
                            <NavLink to="/">Inicio</NavLink>
                            <NavLink to="/info">Información</NavLink>
                            <NavLink to="/reservations">Reservas</NavLink>
                            <NavLink to="/system">Sistema</NavLink>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HamburguerMenu
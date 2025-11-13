import { useMediaQuery } from 'react-responsive';
import NavBarDesktop from './NavBarDesktop';
import NavBarMobile from './NavBarMobile';

/**
 * NavBar Wrapper - Renderiza condicionalmente Desktop o Mobile
 * 
 * IMPORTANTE: No usa display:none, sino verdadero conditional rendering
 * Solo 1 componente existe en el DOM a la vez para máxima performance
 * 
 * Mobile (0-767px): Solo logo + HamburguerMenu
 * Desktop (768px+): Logo + Links animados + UserDropdown
 */
const NavBar = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Renderizado condicional: solo existe 1 componente en el DOM
    return isMobile ? <NavBarMobile /> : <NavBarDesktop />;
};

export { NavBar }
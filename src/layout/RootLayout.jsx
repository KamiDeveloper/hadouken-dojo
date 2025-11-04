import { NavBar } from '../components/NavBar'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import CompleteProfileModal from '../components/CompleteProfileModal'
import Lenis from 'lenis'

const RootLayout = () => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            direction: 'vertical',
            gestureDirection: 'vertical',
            smoothTouch: false,
            touchMultiplier: 2,
        })

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    // Mostrar modal si el usuario necesita completar perfil
    useEffect(() => {
        if (user?.needsProfileCompletion && !user.username) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [user]);

    const handleModalClose = () => {
        // El modal solo se cierra cuando se completa el perfil
        // Esta función es llamada desde el modal después de completar
        setShowModal(false);
    };

    return (
        <div>
            <NavBar />
            <div id="main-app-container">
                <Outlet />
            </div>

            {/* Modal de completar perfil - Bloqueante y persistente */}
            <CompleteProfileModal
                isOpen={showModal}
                onClose={handleModalClose}
            />
        </div>
    )
}

export default RootLayout
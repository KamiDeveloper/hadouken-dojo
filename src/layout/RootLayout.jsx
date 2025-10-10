import { NavBar } from '../components/NavBar'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Lenis from 'lenis'

const RootLayout = () => {
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

    return (
        <div>
            <NavBar />
            <div id="main-app-container">
                <Outlet />
            </div>
        </div>
    )
}

export default RootLayout
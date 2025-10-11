import { lazy, Suspense } from "react"
import Hero from "../components/landing-components/Hero"

// Lazy loading de componentes pesados para mejor performance inicial
const Art = lazy(() => import("../components/landing-components/Art"))
const MaskedArt = lazy(() => import("../components/landing-components/MaskedArt"))
const Art3d = lazy(() => import("../components/landing-components/Art3d"))
const Footer = lazy(() => import("../components/landing-components/Footer"))

const Home = () => {
    return (
        <div id="home-page" className="w-full">
            <Hero />

            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                <Art />
            </Suspense>

            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                <MaskedArt />
            </Suspense>

            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                <Art3d />
            </Suspense>

            <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
                <Footer />
            </Suspense>
        </div>
    )
}

export default Home
import { lazy, Suspense } from "react"
import Hero from "../components/landing-components/Hero"
import ErrorBoundary from "../components/ErrorBoundary"
import { lazyWithRetry } from "../utils/lazyWithRetry"

// Lazy loading con retry automático para manejar errores de red en móviles
const Art = lazy(() => lazyWithRetry(() => import("../components/landing-components/Art")))
const MaskedArt = lazy(() => lazyWithRetry(() => import("../components/landing-components/MaskedArt")))
const Art3d = lazy(() => lazyWithRetry(() => import("../components/landing-components/Art3d")))
const Footer = lazy(() => lazyWithRetry(() => import("../components/landing-components/Footer")))

const Home = () => {
    return (
        <div id="home-page" className="w-full">
            <Hero />

            <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <Art />
                </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <MaskedArt />
                </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <Art3d />
                </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '200px' }} />}>
                    <Footer />
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

export default Home
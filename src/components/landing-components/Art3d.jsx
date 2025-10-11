import { useState, useEffect, useRef } from 'react'
import ThreeScene from './ThreeScene'

const Art3d = () => {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Solo cargar el modelo 3D cuando la sección esté visible
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    // Una vez cargado, no lo descargamos
                }
            },
            {
                root: null,
                rootMargin: '100px', // Cargar 100px antes de que sea visible
                threshold: 0.1
            }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current)
            }
        }
    }, [])

    return (
        <div id='art-3d-section' ref={sectionRef}>
            {/* Header de la sección */}
            <div className="scene-header">
                <h2>Experiencia y Dedicación</h2>
                <p>Explora nuestra escena competitiva desde todos los ángulos.</p>
            </div>

            {/* Canvas de Three.js - LAZY LOADED */}
            {isVisible ? (
                <ThreeScene />
            ) : (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '50%',
                    height: '100vh',
                    backgroundColor: '#010101',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                }}>
                    {/* Placeholder mientras carga */}
                    <div>Cargando...</div>
                </div>
            )}
        </div>
    )
}

export default Art3d
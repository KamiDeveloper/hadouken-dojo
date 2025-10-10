import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import ThreeScene from './ThreeScene'

const Art3d = () => {
    return (
        <div id='art-3d-section'>
            {/* Header de la sección */}
            <div className="scene-header">
                <h2>Experiencia y Dedicación</h2>
                <p>Explora nuestra escena competitiva desde todos los ángulos.</p>
            </div>

            {/* Canvas de Three.js */}
            <Canvas
                className="three-canvas"
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
            >
                <Suspense fallback={null}>
                    {/* Componente de la escena 3D */}
                </Suspense>
            </Canvas>
        </div>
    )
}

export default Art3d
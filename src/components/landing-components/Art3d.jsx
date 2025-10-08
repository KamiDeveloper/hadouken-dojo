import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import ThreeScene from './ThreeScene'

const Art3d = () => {
    return (
        <div id='art-3d-section'>
            {/* Header de la sección */}
            <div className="scene-header">
                <h2>Experiencia 3D</h2>
                <p>Explora nuestra escena interactiva. Usa el mouse para rotar, zoom y explorar.</p>
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
                    <ThreeScene />
                </Suspense>
            </Canvas>
        </div>
    )
}

export default Art3d
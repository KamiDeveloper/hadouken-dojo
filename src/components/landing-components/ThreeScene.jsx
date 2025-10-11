import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Componente del modelo 3D con seguimiento del mouse
const Model = ({ mouseX }) => {
    const modelRef = useRef()
    const { scene } = useGLTF('/assets/3dmodels/PIU.glb')

    // Rotación inicial semi-lateral (30 grados en Y)
    const initialRotation = Math.PI / 6 // 30 grados

    useFrame(() => {
        if (modelRef.current) {
            // Interpolar suavemente la rotación basada en la posición X del mouse
            // mouseX va de -1 (izquierda) a 1 (derecha)
            const targetRotation = initialRotation + (mouseX * Math.PI / 6) // ±30 grados adicionales

            // Lerp suave para la rotación
            modelRef.current.rotation.y = THREE.MathUtils.lerp(
                modelRef.current.rotation.y,
                targetRotation,
                0.05
            )
        }
    })

    return (
        <primitive
            ref={modelRef}
            object={scene}
            scale={0.5}
            position={[0, -1.5, 0]}
            rotation={[0, initialRotation, 0]}
        />
    )
}

// Componente de iluminación dramática
const DramaticLighting = () => {
    return (
        <>
            {/* Luz ambiental suave para definición básica */}
            <ambientLight intensity={0.2} />

            {/* Spotlight principal desde arriba-derecha */}
            <spotLight
                position={[5, 8, 5]}
                angle={0.4}
                penumbra={0.5}
                intensity={2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                color="#ffffff"
            />

            {/* Spotlight secundario desde la izquierda para highlights */}
            <spotLight
                position={[-5, 5, 3]}
                angle={0.3}
                penumbra={0.7}
                intensity={1.5}
                color="#4a90e2"
            />

            {/* Spotlight de relleno desde abajo para evitar sombras duras */}
            <spotLight
                position={[0, -3, 5]}
                angle={0.5}
                penumbra={0.8}
                intensity={0.8}
                color="#ff6b6b"
            />

            {/* Luz direccional de borde */}
            <directionalLight
                position={[-3, 2, -5]}
                intensity={1}
                color="#a855f7"
            />
        </>
    )
}

// Componente principal de la escena
const ThreeScene = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalizar la posición del mouse a -1 (izquierda) a 1 (derecha)
            const x = (event.clientX / window.innerWidth) * 2 - 1
            const y = -(event.clientY / window.innerHeight) * 2 + 1

            setMousePosition({ x, y })
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <div
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100vh',
                backgroundColor: '#010101',
                zIndex: 1
            }}
        >
            <Canvas
                shadows
                style={{ background: '#010101' }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 8]}
                    fov={50}
                />

                <DramaticLighting />

                <Suspense fallback={null}>
                    <Model mouseX={mousePosition.x} />
                </Suspense>

                {/* OrbitControls opcional - puedes desactivarlo si solo quieres el mouse tracking */}
                {/* <OrbitControls 
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                /> */}
            </Canvas>
        </div>
    )
}

export default ThreeScene
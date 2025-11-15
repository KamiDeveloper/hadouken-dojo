import React, { useRef, useEffect, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { throttle } from "../../utils/performance";

// Precargar el modelo GLTF para mejor performance
useGLTF.preload('/assets/models/PIU.glb')

// Componente del modelo 3D con seguimiento del mouse - MEMOIZADO
const Model = React.memo(({ mouseX }) => {
    const modelRef = useRef()
    const { scene } = useGLTF('/assets/models/PIU.glb')

    // Rotación inicial semi-lateral (30 grados en Y)
    const initialRotation = Math.PI / 2.7 // 30 grados

    // Configurar materiales y sombras del modelo - OPTIMIZADO
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    // Solo el modelo proyecta sombras (no recibe para mejor performance)
                    child.castShadow = true
                    child.receiveShadow = false

                    // Optimizar materiales
                    if (child.material) {
                        // Si el material no es compatible con luces, convertirlo
                        if (child.material.isMeshBasicMaterial) {
                            const oldMaterial = child.material
                            child.material = new THREE.MeshStandardMaterial({
                                map: oldMaterial.map,
                                color: oldMaterial.color,
                                metalness: 0.3,
                                roughness: 0.7,
                                // Optimizaciones de material
                                flatShading: false,
                                toneMapped: true
                            })
                        }
                        child.material.needsUpdate = true
                    }

                    // Optimizar geometría
                    if (child.geometry) {
                        child.geometry.computeVertexNormals()
                    }
                }
            })
        }
    }, [scene])

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
            position={[-0.20, -1.5, 0]}
            rotation={[0, initialRotation, 0]}
        />
    )
})

Model.displayName = 'Model'

// Componente de iluminación dramática - OPTIMIZADO (menos sombras)
const DramaticLighting = React.memo(() => {
    const spotLightTarget = useRef()

    return (
        <>
            {/* Target invisible para los spotlights */}
            <group ref={spotLightTarget} position={[0, -1.5, 0]} />

            {/* Luz ambiental - incrementada para compensar menos luces */}
            <ambientLight intensity={0.8} />

            {/* Luz hemisférica para iluminación natural */}
            <hemisphereLight
                color="#ffffff"
                groundColor="#444444"
                intensity={0.8}
                position={[0, 10, 0]}
            />

            {/* SOLO 1 Spotlight con sombras - OPTIMIZACIÓN CRÍTICA */}
            <spotLight
                position={[5, 8, 5]}
                target={spotLightTarget.current}
                angle={0.6}
                penumbra={0.5}
                intensity={4}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-bias={-0.0001}
                shadow-camera-near={1}
                shadow-camera-far={20}
                color="#ffffff"
            />

            {/* Luces sin sombras para efectos de color - MUY LIGERO */}
            <pointLight
                position={[-5, 5, 3]}
                intensity={2}
                distance={20}
                decay={2}
                color="#4a90e2"
            />

            <pointLight
                position={[0, -2, 5]}
                intensity={1.5}
                distance={15}
                decay={2}
                color="#ff6b6b"
            />

            {/* Luz direccional de borde sin sombras */}
            <directionalLight
                position={[-3, 2, -5]}
                intensity={1.5}
                color="#a855f7"
            />
        </>
    )
})

DramaticLighting.displayName = 'DramaticLighting'

// Componente principal de la escena - SUPER OPTIMIZADO
const ThreeScene = () => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })

    // Throttle del mousemove - OPTIMIZACIÓN CRÍTICA
    useEffect(() => {
        const handleMouseMove = throttle((event) => {
            // Normalizar la posición del mouse a -1 (izquierda) a 1 (derecha)
            const x = (event.clientX / window.innerWidth) * 2 - 1
            const y = -(event.clientY / window.innerHeight) * 2 + 1

            setMousePosition({ x, y })
        }, 66) // ~15fps en lugar de 60fps - 75% menos cálculos

        window.addEventListener('mousemove', handleMouseMove, { passive: true })

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
                width: '100%',
                height: '100vh',
                backgroundColor: '#010101',
                zIndex: 1
            }}
        >
            <Canvas
                shadows
                style={{ background: '#010101' }}
                className=' mt-10 md:mt-0'
                dpr={[1, 2]} // Limitar pixel ratio para mejor performance
                performance={{ min: 0.5 }} // Adaptive performance
                gl={{
                    antialias: window.innerWidth > 768, // Solo antialiasing en desktop
                    alpha: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                    // Optimizaciones adicionales
                    logarithmicDepthBuffer: false,
                    precision: 'mediump' // Menor precisión = mejor performance
                }}
                frameloop="always" // Renderizar siempre para animaciones suaves
            >
                <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 8]}
                    fov={50}
                    near={0.1}
                    far={100}
                />

                <DramaticLighting />

                <Suspense fallback={null}>
                    <Model mouseX={mousePosition.x} />
                </Suspense>
            </Canvas>
        </div>
    )
}

export default ThreeScene
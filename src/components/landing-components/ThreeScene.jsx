import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, MeshDistortMaterial, Sphere, Box, Torus, Float, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Componente de esfera animada flotante
const AnimatedSphere = ({ position, color, speed = 1 }) => {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001 * speed
            meshRef.current.rotation.y += 0.002 * speed
        }
    })

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={0.3}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    )
}

// Componente de cubo rotatorio
const RotatingBox = ({ position, color, speed = 1 }) => {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01 * speed
            meshRef.current.rotation.y += 0.01 * speed
        }
    })

    return (
        <Box ref={meshRef} args={[1.5, 1.5, 1.5]} position={position}>
            <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.7}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </Box>
    )
}

// Componente de toro flotante
const FloatingTorus = ({ position, color, speed = 1 }) => {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.005 * speed
            meshRef.current.rotation.z += 0.01 * speed
        }
    })

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Torus ref={meshRef} args={[1, 0.4, 16, 100]} position={position}>
                <meshStandardMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.9}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </Torus>
        </Float>
    )
}

// Partículas de fondo
const Particles = ({ count = 100 }) => {
    const points = useRef()

    const particlesPosition = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 20
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * 20

        particlesPosition.set([x, y, z], i * 3)
    }

    useFrame((state) => {
        if (points.current) {
            points.current.rotation.x += 0.0001
            points.current.rotation.y += 0.0002
        }
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#efefef"
                sizeAttenuation
                transparent
                opacity={0.6}
            />
        </points>
    )
}

// Componente principal de la escena
const ThreeScene = () => {
    return (
        <>
            {/* Cámara personalizada */}
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />

            {/* Controles de órbita - permite rotar la escena con el mouse */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                autoRotate={true}
                autoRotateSpeed={0.5}
                maxDistance={20}
                minDistance={5}
            />

            {/* Luces */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f23506" />
            <pointLight position={[5, -5, 5]} intensity={0.5} color="#007bff" />
            <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.3} penumbra={1} castShadow />

            {/* Environment para reflejos realistas */}
            <Environment preset="city" />

            {/* Objetos 3D - Puedes personalizar estos */}
            <AnimatedSphere position={[-3, 2, 0]} color="#f23506" speed={1} />
            <AnimatedSphere position={[3, -2, 0]} color="#007bff" speed={0.8} />

            <RotatingBox position={[0, 0, 0]} color="#efefef" speed={0.5} />

            <FloatingTorus position={[-2, -2, -2]} color="#f23506" speed={1.2} />
            <FloatingTorus position={[2, 2, -2]} color="#007bff" speed={0.9} />

            {/* Partículas de fondo */}
            <Particles count={150} />

            {/* Plano de fondo opcional */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#010101"
                    roughness={0.8}
                    metalness={0.2}
                    opacity={0.5}
                    transparent
                />
            </mesh>
        </>
    )
}

export default ThreeScene

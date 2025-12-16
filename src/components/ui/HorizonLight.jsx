import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Utilidad para convertir HEX a RGB
 */
const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return isNaN(r) ? '255, 255, 255' : `${r}, ${g}, ${b}`;
};

/**
 * Componente Visual Puro con Animaciones
 */
const HorizonLight = ({ color = '#4f46e5', className = '', animated = true }) => {
    const rgb = hexToRgb(color);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Variantes de animación para cada elemento
    const pillarVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1.2, ease: 'easeOut' }
        },
        animate: {
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.05, 1],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const coreGlowVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1.4, ease: 'easeOut', delay: 0.2 }
        },
        animate: {
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.1, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const hotspotVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 0.9,
            transition: { duration: 1, ease: 'easeOut', delay: 0.4 }
        },
        animate: {
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.15, 1],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const reflectionVariants = {
        hidden: { opacity: 0, scaleY: 0.5 },
        visible: {
            opacity: 0.7,
            scaleY: 1,
            transition: { duration: 1.3, ease: 'easeOut', delay: 0.1 }
        },
        animate: {
            opacity: [0.6, 0.8, 0.6],
            scaleY: [0.95, 1.1, 0.95],
            transition: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const horizonVariants = {
        hidden: { opacity: 0, width: 0 },
        visible: {
            opacity: 0.9,
            width: '100%',
            transition: { duration: 1.5, ease: 'easeOut', delay: 0.3 }
        },
        animate: {
            opacity: [0.7, 1, 0.7],
            textShadow: [
                `0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(${rgb}, 0.4)`,
                `0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(${rgb}, 0.8)`,
                `0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(${rgb}, 0.4)`
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const vignetteVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 1.5, ease: 'easeOut', delay: 0.5 }
        }
    };

    const styles = {
        scene: {
            // Fondo base más profundo y limpio
            background: `radial-gradient(circle at 50% 100%, rgba(${rgb}, 0.12) 0%, #050505 60%, #000000 100%)`,
        },
        pillar: {
            // Gradiente cónico suavizado para evitar bordes duros verticales
            background: `radial-gradient(ellipse at bottom, rgba(${rgb}, 0.25) 0%, rgba(${rgb}, 0.05) 40%, transparent 80%)`,
        },
        pillarup: {
            // Gradiente cónico suavizado para evitar bordes duros verticales
            background: `radial-gradient(ellipse at bottom, rgba(200,200,200, 0.5) 0%, rgba(200,200,200, 0.05) 40%, transparent 80%)`,
        },
        pillarupper: {
            // Gradiente cónico suavizado para evitar bordes duros verticales
            background: `radial-gradient(ellipse at bottom, rgba(250,250,250, 0.90) 0%, rgba(250,250,250, 0.15) 40%, transparent 80%)`,
        },
        coreGlow: {
            // Doble gradiente para un centro más rico
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(${rgb}, 0.6) 30%, rgba(${rgb}, 0.2) 60%, transparent 80%)`,
        },
        reflection: {
            // Reflejo más ancho y difuso en el suelo
            background: `radial-gradient(ellipse at top, rgba(${rgb}, 0.5) 0%, rgba(${rgb}, 0.2) 40%, transparent 75%)`,
        },
        horizonLine: {
            background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0) 100%)`,
            boxShadow: `
            0 0 15px rgba(255, 255, 255, 0.8),
            0 0 30px rgba(${rgb}, 0.8),
            0 -20px 80px rgba(${rgb}, 0.6),
            0 20px 80px rgba(${rgb}, 0.4)
        `,
            // Máscara suavizada en los bordes
            maskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)',
        }
    };

    return (
        <div className={`relative w-full h-full overflow-hidden flex justify-center items-center ${className}`}>
            <div style={styles.scene} className="relative w-full h-full">

                {/* Pilar de luz atmosférica (Redondeado para evitar aspecto cuadrado) */}
                <motion.div
                    style={styles.pillar}
                    variants={pillarVariants}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-[80%] h-[90%] blur-[80px] rounded-[100%] z-10 pointer-events-none mix-blend-screen"
                />
                <motion.div
                    style={styles.pillarup}
                    variants={{
                        ...pillarVariants,
                        animate: {
                            opacity: [0.9, 1, 0.9],
                            scale: [1, 1.08, 1],
                            transition: {
                                duration: 3.5,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }
                        }
                    }}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-[40%] h-[90%] blur-[30px] rounded-[100%] z-10 pointer-events-none mix-blend-screen"
                />
                <motion.div
                    style={styles.pillarupper}
                    variants={{
                        ...pillarVariants,
                        animate: {
                            opacity: [0.85, 0.95, 0.85],
                            scale: [1, 1.12, 1],
                            transition: {
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }
                        }
                    }}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-[20%] h-[90%] blur-[30px] rounded-[100%] z-10 pointer-events-none mix-blend-screen"
                />

                {/* Glow Central Principal */}
                <motion.div
                    style={styles.coreGlow}
                    variants={coreGlowVariants}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-1/2 -translate-x-1/2 translate-y-1/2 scale-x-[2.5] scale-y-[0.5] w-[400px] h-[300px] blur-[40px] rounded-[100%] z-20 mix-blend-screen"
                />

                {/* Núcleo Blanco Intenso (Hotspot) - Reducido y suavizado */}
                <motion.div
                    variants={hotspotVariants}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-1/2 -translate-x-1/2 translate-y-1/2 scale-x-[2] scale-y-[0.3] w-[150px] h-[80px] bg-white blur-[20px] rounded-[100%] z-30 opacity-90"
                />

                {/* Reflejo en el suelo */}
                <motion.div
                    style={styles.reflection}
                    variants={reflectionVariants}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute top-[35%] left-1/2 -translate-x-1/2 scale-x-[2] scale-y-[0.8] w-[500px] h-[200px] blur-[45px] rounded-[100%] z-[6] mix-blend-screen opacity-70 pointer-events-none"
                />

                {/* Línea del Horizonte */}
                <motion.div
                    style={styles.horizonLine}
                    variants={horizonVariants}
                    initial="hidden"
                    animate={animated && isVisible ? ['visible', 'animate'] : 'visible'}
                    className="absolute bottom-[35%] left-0 w-full h-[2px] z-[7] opacity-90"
                />

                {/* Suelo Negro */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute bottom-0 left-0 w-full h-[35%] bg-[#020202] z-[5]"
                />

                {/* Vignette muy suave */}
                <motion.div
                    variants={vignetteVariants}
                    initial="hidden"
                    animate={animated && isVisible ? 'visible' : 'visible'}
                    className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,#000_120%)] z-50 pointer-events-none"
                />

                {/* Ruido granulado sutil */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute inset-0 opacity-20 z-[60] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`
                    }}
                />
            </div>
        </div>
    );
};

export default HorizonLight;
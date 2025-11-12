import { useState, useEffect } from 'react';
import { getVideoSrc } from '../config/videos';

/**
 * Hook personalizado para precargar todos los assets críticos
 * Retorna el estado de carga y el progreso
 * @param {boolean} isMobile - Si es dispositivo móvil (para cargar video correcto)
 */
const useAssetLoader = (isMobile = false) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadedAssets, setLoadedAssets] = useState({});

    useEffect(() => {
        // Obtener el video correcto según el dispositivo (solo 1 se descarga)
        // ⚠️ NO precargamos el video aquí, se carga lazy en Hero.jsx
        // const heroVideoSrc = getVideoSrc('hero', isMobile);

        // Lista de todos los assets críticos a precargar
        const assets = {
            images: [
                '/assets/images/logoland.webp',
                '/assets/images/biglogo.webp',
                '/assets/images/art_1.webp',
                '/assets/images/art_2.webp',
                '/assets/images/art_3.webp'
            ],
            videos: [
                // ✅ Video se carga lazy en Hero, no aquí (evita doble descarga)
            ],
            fonts: [
                '/assets/fonts/tarrget.ttf',
                '/assets/fonts/tarrget3dital.ttf'
            ],
            models: [
                '/assets/models/PIU.glb'
            ]
        };

        const totalAssets = assets.images.length + assets.videos.length + assets.fonts.length + assets.models.length;
        let loadedCount = 0;

        // Función para actualizar el progreso
        const updateProgress = (assetName) => {
            loadedCount++;
            const currentProgress = Math.round((loadedCount / totalAssets) * 100);
            setProgress(currentProgress);
            setLoadedAssets(prev => ({ ...prev, [assetName]: true }));
        };

        // Precargar imágenes
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    updateProgress(src);
                    resolve(img);
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${src}`);
                    updateProgress(src); // Continuar incluso si falla
                    resolve(null);
                };
                img.src = src;
            });
        };

        // Precargar videos
        const loadVideo = (src) => {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.onloadeddata = () => {
                    updateProgress(src);
                    resolve(video);
                };
                video.onerror = () => {
                    console.warn(`Failed to load video: ${src}`);
                    updateProgress(src);
                    resolve(null);
                };
                video.src = src;
                video.load();
            });
        };

        // Precargar fuentes usando FontFace API
        const loadFont = (fontName, src) => {
            return new Promise((resolve) => {
                if ('fonts' in document) {
                    const font = new FontFace(fontName, `url(${src})`, {
                        display: 'swap' // ✅ No bloquear rendering
                    });
                    font.load()
                        .then((loadedFont) => {
                            document.fonts.add(loadedFont);
                            updateProgress(src);
                            resolve(loadedFont);
                        })
                        .catch((error) => {
                            console.warn(`Failed to load font: ${fontName}`, error);
                            updateProgress(src);
                            resolve(null);
                        });
                } else {
                    // Fallback para navegadores que no soportan FontFace API
                    updateProgress(src);
                    resolve(null);
                }
            });
        };
        // Precargar modelos 3D usando GLTFLoader
        const loadModel = (src) => {
            return new Promise((resolve, reject) => {
                // Importar dinámicamente el GLTFLoader
                import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
                    const loader = new GLTFLoader();

                    loader.load(
                        src,
                        (gltf) => {
                            updateProgress(src);
                            resolve(gltf);
                        },
                        (progress) => {
                            // Opcionalmente manejar el progreso de carga individual
                            // console.log(`Loading ${src}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
                        },
                        (error) => {
                            console.warn(`Failed to load model: ${src}`, error);
                            updateProgress(src);
                            resolve(null);
                        }
                    );
                }).catch((error) => {
                    console.warn(`Failed to import GLTFLoader for ${src}`, error);
                    updateProgress(src);
                    resolve(null);
                });
            });
        };

        // Cargar todos los assets
        const loadAllAssets = async () => {
            try {
                const imagePromises = assets.images.map(loadImage);
                const videoPromises = assets.videos.map(loadVideo);
                const fontPromises = [
                    loadFont('Tarrget', assets.fonts[0]),
                    loadFont('Tarrget3D', assets.fonts[1])
                ];
                const modelPromises = assets.models.map(loadModel);

                // Esperar a que todos los assets se carguen
                await Promise.all([
                    ...imagePromises,
                    ...videoPromises,
                    ...fontPromises,
                    ...modelPromises
                ]);

                // Pequeño delay para transición suave
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);

            } catch (error) {
                console.error('Error loading assets:', error);
                // Continuar incluso si hay errores
                setIsLoading(false);
            }
        };

        loadAllAssets();

    }, [isMobile]); // Dependencia de isMobile para recargar si cambia

    return { isLoading, progress, loadedAssets };
};

export default useAssetLoader;

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para precargar todos los assets críticos
 * Retorna el estado de carga y el progreso
 */
const useAssetLoader = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadedAssets, setLoadedAssets] = useState({});

    useEffect(() => {
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
                '/assets/videos/hero-video.mp4'
            ],
            fonts: [
                '/assets/fonts/tarrget.ttf',
                '/assets/fonts/tarrget3dital.ttf'
            ]
        };

        const totalAssets = assets.images.length + assets.videos.length + assets.fonts.length;
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
                    const font = new FontFace(fontName, `url(${src})`);
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

        // Cargar todos los assets
        const loadAllAssets = async () => {
            try {
                const imagePromises = assets.images.map(loadImage);
                const videoPromises = assets.videos.map(loadVideo);
                const fontPromises = [
                    loadFont('Tarrget', assets.fonts[0]),
                    loadFont('Tarrget3D', assets.fonts[1])
                ];

                // Esperar a que todos los assets se carguen
                await Promise.all([
                    ...imagePromises,
                    ...videoPromises,
                    ...fontPromises
                ]);

                // Pequeño delay para transición suave
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);

            } catch (error) {
                console.error('Error loading assets:', error);
                // Continuar incluso si hay errores
                setIsLoading(false);
            }
        };

        loadAllAssets();

    }, []);

    return { isLoading, progress, loadedAssets };
};

export default useAssetLoader;

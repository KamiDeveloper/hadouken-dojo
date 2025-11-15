import { useRef, useEffect, useState } from 'react'
import { useIsMobile } from '../../context/ResponsiveContext'
import RotatingText from './RotatingText'
import { useAuth } from '../../context/AuthContext'
import { NavLink } from 'react-router-dom';
import { FlipButton } from '../ui/FlipButton';
import { getVideoSrc } from '../../config/videos';
import { getImageSrc } from '../../config/images';
import { useLoading } from '../../context/LoadingContext';

const Hero = () => {

    const { user } = useAuth();
    const { isLoading } = useLoading(); // Skeleton loading state
    const isMobile = useIsMobile()
    const videoRef = useRef(null)
    const [videoReady, setVideoReady] = useState(false)
    const [shouldAutoplay, setShouldAutoplay] = useState(false)

    // ✅ OPTIMIZACIÓN 1: Cargar video DESPUÉS del skeleton (evita doble carga)
    useEffect(() => {
        if (!isLoading && videoRef.current && !videoReady) {
            const video = videoRef.current;

            const handleLoadedData = () => {
                setVideoReady(true);
            };

            video.addEventListener('loadeddata', handleLoadedData);
            video.load(); // Iniciar carga del video

            return () => {
                video.removeEventListener('loadeddata', handleLoadedData);
            };
        }
    }, [isLoading, videoReady]);

    // ✅ OPTIMIZACIÓN 2: Delay autoplay para que React termine de hidratar
    useEffect(() => {
        if (videoReady && videoRef.current) {
            const timer = setTimeout(() => {
                setShouldAutoplay(true);
                videoRef.current?.play().catch(err => {
                    console.log('Autoplay prevented:', err);
                });
            }, 300); // 300ms delay para hidratación

            return () => clearTimeout(timer);
        }
    }, [videoReady]);

    // ✅ OPTIMIZACIÓN 3: IntersectionObserver mejorado
    useEffect(() => {
        if (videoRef.current && shouldAutoplay) {
            videoRef.current.playbackRate = 1.0

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => { });
                    } else {
                        videoRef.current?.pause()
                    }
                },
                {
                    threshold: 0.5, // ✅ 50% visible (antes 25%)
                    rootMargin: '0px 0px -100px 0px' // ✅ Delay para scroll rápido
                }
            )

            observer.observe(videoRef.current)

            return () => observer.disconnect()
        }
    }, [shouldAutoplay])

    return (
        <div id="hero">
            <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="none" // ✅ No carga hasta que se necesite (antes "metadata")
                className="hero-video"
                aria-hidden="true"
                disablePictureInPicture
                controlsList="nodownload"
                style={{
                    opacity: videoReady ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out'
                }}
            >
                <source
                    src={getVideoSrc('hero', isMobile)}
                    type="video/mp4"
                />
            </video>

            <div className="hero-container">
                <div className="hero-gradient"></div>
                <div className="hero-content">
                    <div className="biglogo">
                        <img src={getImageSrc('biglogo', isMobile)} type="image/webp" alt="Big Logo" />
                    </div>
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Donde Nacen los <span className="rotating-text">
                                <RotatingText
                                    text={['Campeones', 'Ganadores', 'Mejores', 'Gamers', 'Pro Players', 'Vencedores']}
                                    duration={2000}
                                />
                            </span>
                        </h1>
                        <p className="hero-description">
                            Únete a nuestra comunidad y domina el arte del juego competitivo
                        </p>
                        {/* <ScrollArrow /> */}
                    </div>
                    <div className="acces-button absolute md:translate-y-90 translate-y-70 z-50">
                        {user ? (
                            <div className="flex" />
                        ) : (
                            <div className="flex">
                                <NavLink to="/getstarted">
                                    <FlipButton
                                        frontText="Accede Ya!"
                                        backText={<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path strokeDasharray="36" strokeDashoffset="36" d="M13 4l7 0c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-7"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="36;0" /></path><path strokeDasharray="14" strokeDashoffset="14" d="M3 12h11.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="14;0" /></path><path strokeDasharray="6" strokeDashoffset="6" d="M14.5 12l-3.5 -3.5M14.5 12l-3.5 3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="6;0" /></path></g></svg>}
                                        from="left"
                                        frontClassName="bg-[var(--color-white)]/95 font-bold !text-[var(--color-black)] "
                                        backClassName="bg-[var(--color-black)]/70 text-[var(--color-white)]"
                                    />
                                </NavLink>
                            </div>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
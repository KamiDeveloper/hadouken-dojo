import { useRef, useEffect } from 'react'
import RotatingText from './RotatingText'
import ScrollArrow from '../ui/ScrollArrow'

const Hero = () => {
    const videoRef = useRef(null)

    useEffect(() => {
        // Optimizar reproducción del video
        if (videoRef.current) {
            videoRef.current.playbackRate = 1.0

            // Pausar video cuando no esté visible (ahorra recursos)
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play()
                    } else {
                        videoRef.current?.pause()
                    }
                },
                { threshold: 0.25 }
            )

            observer.observe(videoRef.current)

            return () => observer.disconnect()
        }
    }, [])

    return (
        <div id="hero">
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata" // Cambiar de auto a metadata para cargar menos datos
                className="hero-video"
                aria-hidden="true"
                loading="lazy"
                // Optimizaciones adicionales
                disablePictureInPicture
                controlsList="nodownload"
            >
                <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
            </video>

            <div className="hero-container">
                <div className="hero-gradient"></div>
                <div className="hero-content">
                    <div className="biglogo">
                        <img src="/assets/images/biglogo.webp" type="image/webp" alt="Big Logo" />
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
                </div>
            </div>
        </div>
    )
}

export default Hero
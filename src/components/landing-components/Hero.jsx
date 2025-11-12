import { useRef, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import RotatingText from './RotatingText'
import { useAuth } from '../../context/AuthContext'
import { NavLink } from 'react-router-dom';
import { FlipButton } from '../ui/FlipButton';
import { getVideoSrc } from '../../config/videos';

const Hero = () => {

    const { user } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 767 })
    const videoRef = useRef(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 1.0

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
                <source
                    src={getVideoSrc('hero', isMobile)}
                    type="video/mp4"
                />
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
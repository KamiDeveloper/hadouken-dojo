import RotatingText from './RotatingText'

const Hero = () => {
    return (
        <div id="hero" >
            <video autoPlay muted loop playsInline preload="auto" className="hero-video" aria-hidden="true">
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
                        <div className="hero-cta">
                            <a href="#reservations" className="cta-primary">
                                Reserva tu Clase Gratis
                            </a>
                            <a href="#info" className="cta-secondary">
                                Conoce Más
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
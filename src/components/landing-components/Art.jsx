import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useMediaQuery } from "react-responsive"

const Art = () => {

    const isMobile = useMediaQuery({ maxWidth: 767 })

    useGSAP(() => {
        // OPTIMIZACIÓN: Configuración de ScrollTrigger más eficiente
        const headerArtTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#art',
                start: "top center",
                end: "center center",
                toggleActions: "play none none reverse",
                // Optimizaciones de performance
                fastScrollEnd: true,
                preventOverlaps: true,
                invalidateOnRefresh: false
            }
        })
        headerArtTimeline.from('.art-title, .art-subtitle', {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.5,
            // Optimización: usar will-change
            willChange: 'transform, opacity'
        })

        const gridArtTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.art-content',
                start: "top center",
                end: "75% center",
                scrub: 1, // Agregar valor numérico para suavizar (1 segundo de delay)
                // Optimizaciones de performance
                fastScrollEnd: true,
                preventOverlaps: true,
                invalidateOnRefresh: false
            }
        })



        if (isMobile) {
            gridArtTimeline.fromTo('.art-image-section', {
                gap: '0.5rem',
                opacity: 0,
                y: 100,
                borderRadius: '0.1rem',
            }, {
                scale: 2,
                opacity: 1,
                willChange: 'transform, opacity'
            }).to('.art-image1', {
                x: 100,
                willChange: 'transform'
            }, '<').to('.art-image3', {
                x: -100,
                willChange: 'transform'
            }, '<').fromTo('.art-image2', {
                opacity: 0,
                x: 50
            }, {
                opacity: 1,
                x: -50,
                willChange: 'transform, opacity'
            })
        } else {
            gridArtTimeline
                .from('.art-image1', {
                    x: 600,
                    opacity: 0,
                    duration: 1,
                    ease: 'power4.out',
                    stagger: 1,
                    willChange: 'transform, opacity'
                })

                .from('.art-image3', {
                    x: -600,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power4.out',
                    stagger: 1,
                    willChange: 'transform, opacity'
                })
        }


    }, [isMobile]) // Agregar dependencia para re-ejecutar si cambia



    return (
        <div id="art">
            <div className="art-content">
                <div className="art-header">
                    <h2 className="art-title">El Arte del Juego Competitivo</h2>
                    <p className="art-subtitle">
                        Descubre la gloria y el poder de la estrategia del juego competitivo
                    </p>
                </div>

                <div className="art-container">
                    <div className="art-image-section">
                        <img
                            src="/assets/images/art_1.webp"
                            alt="Gaming"
                            className="art-image1 art-img"
                            loading="lazy"
                            decoding="async"
                        />
                        <img
                            src="/assets/images/art_2.webp"
                            alt="Gaming"
                            className="art-image2 art-img"
                            loading="lazy"
                            decoding="async"
                        />
                        <img
                            src="/assets/images/art_3.webp"
                            alt="Gaming"
                            className="art-image3 art-img"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="art-image-overlay">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Art;
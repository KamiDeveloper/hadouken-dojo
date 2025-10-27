import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useMediaQuery } from "react-responsive"

const Art = () => {

    const isMobile = useMediaQuery({ maxWidth: 767 })

    useGSAP(() => {
        const headerArtTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#art',
                start: "top center",
                end: "center center",
                toggleActions: "play none none reverse",
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
            willChange: 'transform, opacity'
        })

        const gridArtTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.art-content',
                start: "top center",
                end: "75% center",
                scrub: 1,
                fastScrollEnd: true,
                preventOverlaps: true,
                invalidateOnRefresh: false
            }
        })



        if (isMobile) {
            gridArtTimeline.fromTo('.art-image-section', {
                gap: '0.5rem',
                opacity: 0,
                scale: 2,
                y: 100,
                borderRadius: '0.1rem',
            }, {
                scale: 1.5,
                opacity: 1,
                willChange: 'transform, opacity'
            }).to('.art-image1', {
                x: 100,
                willChange: 'transform'
            }, '<').to('.art-image3', {
                x: -100,
                willChange: 'transform'
            }, '<').to('.description-1', {
                x: -200,
                ease: 'power4.out',
                willChange: 'transform'
            }, '<').to('.description-2', {
                x: 200,
                ease: 'power4.out',
                willChange: 'transform'
            }, '<')
                .fromTo('.art-image2', {
                    opacity: 0,
                    x: 50,
                    willChange: 'transform, opacity'
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
                    duration: 0.75,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                })
                .fromTo('.description-1', {
                    y: 100,
                    x: -200,
                    opacity: 0,
                    duration: 0.25,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                }, {
                    y: 0,
                    opacity: 0.9,
                    duration: 0.25,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                })
                .from('.art-image3', {
                    x: -600,
                    opacity: 0,
                    duration: 0.75,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                })
                .fromTo('.description-2', {
                    y: 100,
                    x: 200,
                    opacity: 0,
                    duration: 0.25,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                }, {
                    y: 0,
                    opacity: 0.9,
                    duration: 0.25,
                    ease: 'power4.out',
                    willChange: 'transform, opacity'
                })
        }


    }, [isMobile])



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
                        <p className="art-description description-1">
                            Rompe tus límites y compite con los mejores en todos los rincones del mundo.
                        </p>
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
                        <p className="art-description description-2">
                            Demuestra de que estás hecho y alcanza la cima, no importa que tan grande sea el desafío.
                        </p>
                        <div className="art-image-overlay">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Art;
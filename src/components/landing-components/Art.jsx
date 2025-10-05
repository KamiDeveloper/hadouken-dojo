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
                toggleActions: "play none none reverse"
            }
        })
        headerArtTimeline.from('.art-title, .art-subtitle', {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.5
        })

        const gridArtTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.art-content',
                start: "top center",
                end: "75% center",
                scrub: true,
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
            }).to('.art-image1', {
                x: 100
            }, '<').to('.art-image3', {
                x: -100
            }, '<').fromTo('.art-image2', {
                opacity: 0,
                x: 50
            }, {
                opacity: 1,
                x: -50
            })
        } else {
            gridArtTimeline
                .from('.art-image1', {
                    x: 600,
                    opacity: 0,
                    duration: 1,
                    ease: 'power4.out',
                    stagger: 1
                })

                .from('.art-image3', {
                    x: -600,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power4.out',
                    stagger: 1
                })
        }


    }, [])



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
                        />
                        <img
                            src="/assets/images/art_2.webp"
                            alt="Gaming"
                            className="art-image2 art-img"
                        />
                        <img
                            src="/assets/images/art_3.webp"
                            alt="Gaming"
                            className="art-image3 art-img"
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
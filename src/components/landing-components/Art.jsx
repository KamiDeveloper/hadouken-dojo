import { useRef } from 'react';
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

const Art = () => {

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
                trigger: '.art-image-section',
                start: "top center",
                end: "80% center",
                scrub: true,
            }
        })

        gridArtTimeline
            .from('.art-image1', {
                x: 600,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                stagger: 1
            })
            .from('.art-image2', {
                y: 100,
                opacity: 0,
                duration: 0.5,
                ease: 'power4.out',
                stagger: 1
            })
            .from('.art-image3', {
                x: -600,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                stagger: 1
            })


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
                            src="/assets/images/art2.png"
                            alt="Gaming"
                            className="art-image1 art-img"
                        />
                        <img
                            src="/assets/images/art.jpg"
                            alt="Gaming"
                            className="art-image2 art-img"
                        />
                        <img
                            src="/assets/images/art3.png"
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
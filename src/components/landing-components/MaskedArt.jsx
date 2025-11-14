import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useMediaQuery } from "react-responsive"
import { getImageSrc } from "../../config/images"

const MaskedArt = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 })

    useGSAP(() => {
        const start = isMobile ? 'top 20%' : 'top top'

        const maskTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#masked-section',
                start,
                end: '+=3000 center',
                scrub: 1,
                pin: true,
                // Optimizaciones de performance
                fastScrollEnd: true,
                preventOverlaps: true,
                anticipatePin: 1
            }
        })
        if (isMobile) {
            maskTimeline.fromTo('.catchword', {
                opacity: 0
            }, {
                opacity: 1,
                ease: "power1.inOut",
                willChange: 'opacity'
            })
                .to('.will-fade', {
                    opacity: 0,
                    stagger: 0.2,
                    ease: "power1.inOut",
                    willChange: 'opacity'
                })
                .to('.masked-img', {
                    scale: 0.8,
                    maskPosition: '47% 50%',
                    maskSize: '12000%',
                    duration: 1,
                    ease: "power1.inOut",
                    willChange: 'transform'
                })
                .to('#masked-content', {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power1.inOut",
                    willChange: 'opacity'
                })
        } else {
            maskTimeline
                .fromTo('.catchword', {
                    x: 0,
                    opacity: 0
                }, {
                    x: 220,
                    duration: 2,
                    opacity: 1,
                    ease: "power1.inOut",
                    willChange: 'transform, opacity'
                })
                .to('.will-fade', {
                    opacity: 0,
                    stagger: 0.2,
                    ease: "power1.inOut",
                    willChange: 'opacity'
                })
                .to('.masked-img', {
                    scale: 0.8,
                    maskPosition: '47% 50%',
                    maskSize: '12000%',
                    duration: 1,
                    ease: "power1.inOut",
                    willChange: 'transform'
                })
                .to('#masked-content', {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power1.inOut",
                    willChange: 'opacity'
                })
        }
    }, [isMobile]) // Agregar dependencia
    return (
        <div id="masked-section">
            <div className="container mx-auto h-full pt-20">
                <div className="content">
                    <div className="tekken-8-img">
                        <img
                            src={getImageSrc('artUpper', isMobile)}
                            alt="Tekken Passion"
                            className="abs-center masked-img size-full object-contain"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>
                <div className="masked-container">
                    <h2 className="will-fade catchword">"The best fights are personal"</h2>
                    <div id="masked-content">
                        <h3>Experimenta tu verdadero ser</h3>
                        <p>No es sólo un juego, es una forma de vida, el camino a la maestría y encontrar tu verdadero potencial.</p>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default MaskedArt
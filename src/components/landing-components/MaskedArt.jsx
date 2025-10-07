import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useMediaQuery } from "react-responsive"

const MaskedArt = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 })

    useGSAP(() => {
        const start = isMobile ? 'top 20%' : 'top top'

        const maskTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#masked-section',
                start,
                end: 'bottom center',
                scrub: 1.5,
                pin: true
            }
        })
        if (isMobile) {
            maskTimeline.to('.will-fade', {
                opacity: 0,
                stagger: 0.2,
                ease: "power1.inOut"
            })
                .to('.masked-img', {
                    scale: 0.8,
                    maskPosition: '47% 50%',
                    maskSize: '12000%',
                    duration: 1,
                    ease: "power1.inOut"
                })
                .to('#masked-content', {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power1.inOut"
                })
        } else {
            maskTimeline
                .to('.catchword', {
                    x: 220,
                    duration: 1
                })
                .to('.will-fade', {
                    opacity: 0,
                    stagger: 0.2,
                    ease: "power1.inOut"
                })
                .to('.masked-img', {
                    scale: 0.8,
                    maskPosition: '47% 50%',
                    maskSize: '12000%',
                    duration: 1,
                    ease: "power1.inOut"
                })
                .to('#masked-content', {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power1.inOut"
                })
        }
    }, [])
    return (
        <div id="masked-section">
            <div className="container mx-auto h-full pt-20">
                <div className="content">
                    <div className="tekken-8-img">
                        <img
                            src="assets/images/art-upper.jpg"
                            alt="Tekken Passion"
                            className="abs-center masked-img size-full object-contain"
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
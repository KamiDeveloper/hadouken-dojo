import Hero from "../components/landing-components/Hero"
import Art from "../components/landing-components/Art"
import Footer from "../components/landing-components/Footer"
import MaskedArt from "../components/landing-components/MaskedArt"


const Home = () => {
    return (
        <div id="home-page" className="w-full">
            <Hero />
            <Art />
            <MaskedArt />

            <Footer />
        </div>

    )
}

export default Home
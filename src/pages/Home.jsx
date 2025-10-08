import Hero from "../components/landing-components/Hero"
import Art from "../components/landing-components/Art"
import Footer from "../components/landing-components/Footer"
import MaskedArt from "../components/landing-components/MaskedArt"
import Art3d from "../components/landing-components/Art3d"


const Home = () => {
    return (
        <div id="home-page" className="w-full">
            <Hero />
            <Art />
            <MaskedArt />
            <Art3d />

            <Footer />
        </div>

    )
}

export default Home
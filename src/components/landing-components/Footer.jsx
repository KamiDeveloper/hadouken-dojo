

import { Link } from "react-router-dom"

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer id="footer" >
            <div className="footer-container">
                <div className="footer-left-content">
                    <p className="message">Sé parte de nuestra comunidad.</p>
                </div>
                <div className="footer-center-content">
                    <p className="copyright">
                        &copy; {currentYear} Hadouken Dojo. Todos los derechos reservados.
                    </p>
                </div>
                <div className="footer-credit">
                    <p >
                        Desarrollado con ❤️ por <span className="highlight">KamiDeveloper</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
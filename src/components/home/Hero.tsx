import { motion } from "framer-motion"

function Hero() {
    return (
        <section className="hero">
            <div className="hero-overlay">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>ROTANZA</h1>

                    <p>
                        Software para gestão de transportes, com controle da operação do início ao fim.
                    </p>

                    <a href="#recursos" className="btn-hero">
                        CONHEÇA A PLATAFORMA
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero

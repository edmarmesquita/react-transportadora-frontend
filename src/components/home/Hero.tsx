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
                        Eficiência, Segurança e Pontualidade em cada quilômetro.
                    </p>

                    <a href="#cotacao" className="btn-hero">
                        SOLICITAR COTAÇÃO AGORA
                    </a>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero

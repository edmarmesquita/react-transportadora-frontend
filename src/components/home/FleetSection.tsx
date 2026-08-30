import { motion } from "framer-motion"

import FleetCard from "../ui/FleetCard"

function FleetSection() {
    return (
        <section className="fleet-section">
            <div className="container-central">
                <div className="section-title">
                    <h2>Nossa Frota</h2>

                    <p>
                        Veículos preparados para diferentes tipos de transporte.
                    </p>
                </div>

                <motion.div
                    className="fleet-grid"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: {},

                        visible: {
                            transition: {
                                staggerChildren: 0.25,
                            },
                        },
                    }}
                >
                    <FleetCard
                        imagem="/caminhao_ramos.jpg"
                        titulo="Caminhões Rastreados"
                        descricao="Mais segurança e controle em cada etapa do transporte."
                    />

                    <FleetCard
                        imagem="/caminhao_ramos.jpg"
                        titulo="Carga Fracionada"
                        descricao="Soluções econômicas para volumes menores e entregas ágeis."
                    />

                    <FleetCard
                        imagem="/caminhao_ramos.jpg"
                        titulo="Carga Lotação"
                        descricao="Transporte dedicado para grandes volumes com máxima eficiência."
                    />
                </motion.div>
            </div>
        </section>
    )
}

export default FleetSection

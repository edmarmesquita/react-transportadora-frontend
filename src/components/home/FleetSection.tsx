import { motion } from "framer-motion"

import FleetCard from "../ui/FleetCard"

function FleetSection() {
    return (
        <section id="recursos" className="fleet-section">
            <div className="container-central">
                <div className="section-title">
                    <h2>Gestão completa para sua transportadora</h2>

                    <p>
                        Recursos conectados para transformar a rotina operacional em decisões mais claras.
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
                        titulo="Frota conectada"
                        descricao="Centralize veículos, motoristas e disponibilidade para planejar cada viagem."
                    />

                    <FleetCard
                        titulo="Cargas e viagens"
                        descricao="Organize etapas, responsáveis e status em um fluxo operacional único."
                    />

                    <FleetCard
                        titulo="Rastreamento e comprovantes"
                        descricao="Dê visibilidade à operação e registre evidências de entrega com segurança."
                    />
                </motion.div>
            </div>
        </section>
    )
}

export default FleetSection

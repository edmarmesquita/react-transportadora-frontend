import { motion } from "framer-motion"

type FleetCardProps = {
    imagem?: string
    titulo: string
    descricao: string
}

function FleetCard({
    imagem,
    titulo,
    descricao,
}: FleetCardProps) {
    return (
        <motion.article
            className="fleet-card"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
        >
            {imagem ? (
                <img src={imagem} alt={titulo} />
            ) : (
                <div className="fleet-card-media" aria-hidden="true" />
            )}

            <div className="fleet-card-content">
                <h3>{titulo}</h3>

                <p>{descricao}</p>
            </div>
        </motion.article>
    )
}

export default FleetCard

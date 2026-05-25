type FleetInfoCardProps = {
    imagem: string
    titulo: string
    descricao: string
}

function FleetInfoCard({
    imagem,
    titulo,
    descricao,
}: FleetInfoCardProps) {
    return (
        <article className="fleet-info-card">
            <img src={imagem} alt={titulo} />

            <div className="fleet-info-content">
                <h3>{titulo}</h3>

                <p>{descricao}</p>
            </div>
        </article>
    )
}

export default FleetInfoCard
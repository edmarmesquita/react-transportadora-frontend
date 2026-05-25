import type { IconType } from "react-icons"

type InfoCardProps = {
    titulo: string
    descricao: string
    Icone: IconType
}

function InfoCard({
    titulo,
    descricao,
    Icone,
}: InfoCardProps) {
    return (
        <article className="info-card">
            <div className="info-icon">
                <Icone />
            </div>

            <h3>{titulo}</h3>

            <p>{descricao}</p>
        </article>
    )
}

export default InfoCard
type StatCardProps = {
    numero: string
    texto: string
}

function StatCard({
    numero,
    texto,
}: StatCardProps) {
    return (
        <div className="stat-card">
            <h2>{numero}</h2>

            <p>{texto}</p>
        </div>
    )
}

export default StatCard
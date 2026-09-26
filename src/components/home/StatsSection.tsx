import FadeIn from "../ui/FadeIn"
import StatCard from "../ui/StatCard"

function StatsSection() {
    return (
        <section className="stats-section">
            <div className="container-central">
                <FadeIn>
                    <div className="stats-grid">
                        <StatCard numero="01" texto="Operação centralizada" />

                        <StatCard numero="24h" texto="Visibilidade das viagens" />

                        <StatCard numero="360°" texto="Gestão da frota" />

                        <StatCard numero="+" texto="Portais para sua operação" />
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}

export default StatsSection

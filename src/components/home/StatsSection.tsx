import FadeIn from "../ui/FadeIn"
import StatCard from "../ui/StatCard"

function StatsSection() {
    return (
        <section className="stats-section">
            <div className="container-central">
                <FadeIn>
                    <div className="stats-grid">
                        <StatCard numero="+15" texto="Anos de experiência" />

                        <StatCard numero="+120" texto="Veículos na frota" />

                        <StatCard numero="+500" texto="Clientes atendidos" />

                        <StatCard numero="100%" texto="Cobertura nacional" />
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}

export default StatsSection
import Layout from "../components/layout/Layout"

import Hero from "../components/home/Hero"
import StatsSection from "../components/home/StatsSection"
import FleetSection from "../components/home/FleetSection"
import TrackingSection from "../components/home/TrackingSection"
import QuoteSection from "../components/home/QuoteSection"

import CTASection from "../components/ui/CTASection"

function Home() {
    return (
        <Layout>
            <Hero />

            <StatsSection />

            <FleetSection />

            <TrackingSection />

            <CTASection
                titulo="Sua transportadora merece uma operação mais previsível."
                texto="Centralize cargas, viagens, veículos, motoristas e acompanhamento em uma única plataforma."
                botaoTexto="Conhecer a ROTANZA"
                link="/sobre"
            />

            <QuoteSection />
        </Layout>
    )
}

export default Home

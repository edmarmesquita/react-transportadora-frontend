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
                titulo="Precisa transportar sua carga com segurança?"
                texto="Solicite agora uma cotação e fale com nossa equipe."
                botaoTexto="Solicitar Cotação"
                link="#cotacao"
            />

            <QuoteSection />
        </Layout>
    )
}

export default Home
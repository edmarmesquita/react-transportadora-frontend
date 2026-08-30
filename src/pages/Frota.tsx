import Layout from "../components/layout/Layout"

import PageBanner from "../components/ui/PageBanner"
import FleetInfoCard from "../components/ui/FleetInfoCard"

import CTASection from "../components/ui/CTASection"

function Frota() {
    return (
        <Layout>
            <PageBanner
                titulo="Nossa Frota"
                subtitulo="Veículos modernos preparados para todo o Brasil."
            />

            <section className="fleet-info-section">
                <div className="container-central">
                    <div className="fleet-info-grid">
                        <FleetInfoCard
                            imagem="/caminhao_ramos.jpg"
                            titulo="Carreta Baú"
                            descricao="Ideal para transporte seguro de cargas secas e protegidas contra intempéries."
                        />

                        <FleetInfoCard
                            imagem="/caminhao_ramos.jpg"
                            titulo="Carga Fracionada"
                            descricao="Veículos preparados para distribuição eficiente e entregas rápidas."
                        />

                        <FleetInfoCard
                            imagem="/caminhao_ramos.jpg"
                            titulo="Carga Lotação"
                            descricao="Transporte dedicado para grandes operações logísticas."
                        />

                        <FleetInfoCard
                            imagem="/caminhao_ramos.jpg"
                            titulo="Frota Rastreadora"
                            descricao="Monitoramento em tempo real oferecendo mais segurança e controle."
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Sua carga merece segurança."
                texto="Conte com nossa frota moderna para transportar com eficiência."
                botaoTexto="Solicitar Cotação"
                link="/#cotacao"
            />
        </Layout>
    )
}

export default Frota

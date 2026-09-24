import {
    FaBuilding,
    FaHandshake,
    FaTruckMoving,
    FaUsers,
} from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Parceiros() {
    return (
        <Layout>
            <PageBanner
                titulo="Parceiros"
                subtitulo="Parcerias sólidas que fortalecem nossa logística."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Nossos Parceiros</h2>

                        <p>
                            Trabalhamos ao lado de empresas comprometidas com qualidade e eficiência.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Distribuição"
                            descricao="Empresas parceiras responsáveis pela distribuição estratégica de cargas."
                            Icone={FaTruckMoving}
                        />

                        <InfoCard
                            titulo="Centros Logísticos"
                            descricao="Estruturas preparadas para armazenagem e movimentação eficiente."
                            Icone={FaBuilding}
                        />

                        <InfoCard
                            titulo="Relacionamento"
                            descricao="Parcerias construídas com confiança, transparência e compromisso."
                            Icone={FaHandshake}
                        />

                        <InfoCard
                            titulo="Equipe Especializada"
                            descricao="Profissionais capacitados para garantir excelência operacional."
                            Icone={FaUsers}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Quer ser nosso parceiro?"
                texto="Entre em contato e descubra oportunidades de parceria."
                botaoTexto="Falar com a Equipe"
                link="/contato"
            />
        </Layout>
    )
}

export default Parceiros

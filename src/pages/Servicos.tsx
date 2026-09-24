import {
    FaBox,
    FaMapMarkedAlt,
    FaShieldAlt,
    FaTruck,
} from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Servicos() {
    return (
        <Layout>
            <PageBanner
                titulo="Serviços"
                subtitulo="Soluções logísticas com segurança, agilidade e compromisso."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Nossos Serviços</h2>
                        <p>Atendimento completo para diferentes necessidades de transporte.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Carga Fracionada"
                            descricao="Ideal para entregas menores, com economia, agilidade e acompanhamento em todo o trajeto."
                            Icone={FaBox}
                        />

                        <InfoCard
                            titulo="Carga Lotação"
                            descricao="Transporte exclusivo para grandes volumes, oferecendo mais controle, segurança e rapidez."
                            Icone={FaTruck}
                        />

                        <InfoCard
                            titulo="Rastreamento"
                            descricao="Monitoramento da carga para oferecer mais transparência e confiança ao cliente."
                            Icone={FaMapMarkedAlt}
                        />

                        <InfoCard
                            titulo="Segurança"
                            descricao="Processos pensados para proteger sua carga desde a coleta até a entrega."
                            Icone={FaShieldAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Precisa de uma solução logística?"
                texto="Fale com nossa equipe e solicite uma cotação personalizada."
                botaoTexto="Solicitar Cotação"
                link="/#cotacao"
            />
        </Layout>
    )
}

export default Servicos

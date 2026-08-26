import {
    FaHandshake,
    FaMapMarkedAlt,
    FaShieldAlt,
    FaTruck,
} from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Sobre() {
    return (
        <Layout>
            <PageBanner
                titulo="Sobre Nós"
                subtitulo="Transporte de cargas com segurança, eficiência e compromisso."
            />

            <section className="cards-section">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Quem Somos</h2>
                        <p>
                            A Transportadora Ramos oferece soluções de transporte
                            voltadas à segurança da carga, à eficiência operacional
                            e à transparência durante o trajeto.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Nossa Missão"
                            descricao="Realizar o transporte de cargas com responsabilidade, cuidado e compromisso em cada etapa."
                            Icone={FaTruck}
                        />

                        <InfoCard
                            titulo="Segurança"
                            descricao="Processos pensados para proteger a carga desde a coleta até a entrega."
                            Icone={FaShieldAlt}
                        />

                        <InfoCard
                            titulo="Tecnologia"
                            descricao="Acompanhamento das operações para oferecer mais visibilidade e confiança."
                            Icone={FaMapMarkedAlt}
                        />

                        <InfoCard
                            titulo="Atendimento"
                            descricao="Relacionamento baseado em clareza, atenção e compromisso com cada necessidade."
                            Icone={FaHandshake}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Conte com a Transportadora Ramos"
                texto="Fale com nossa equipe e encontre a solução adequada para sua carga."
                botaoTexto="Solicitar Cotação"
                link="/#cotacao"
            />
        </Layout>
    )
}

export default Sobre

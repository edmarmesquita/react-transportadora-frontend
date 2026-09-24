import {
    FaClipboardCheck,
    FaIdCard,
    FaRoute,
    FaTruck,
} from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Motorista() {
    return (
        <Layout>
            <PageBanner
                titulo="Área do Motorista"
                subtitulo="Espaço dedicado aos nossos motoristas parceiros."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Recursos para Motoristas</h2>

                        <p>
                            Organização, comunicação e suporte para quem está na estrada.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Rotas"
                            descricao="Acompanhe informações importantes sobre trajetos e entregas."
                            Icone={FaRoute}
                        />

                        <InfoCard
                            titulo="Checklist"
                            descricao="Controle de documentos, veículo e etapas da operação."
                            Icone={FaClipboardCheck}
                        />

                        <InfoCard
                            titulo="Cadastro"
                            descricao="Área para dados e informações do motorista parceiro."
                            Icone={FaIdCard}
                        />

                        <InfoCard
                            titulo="Veículo"
                            descricao="Informações relacionadas ao caminhão e à operação."
                            Icone={FaTruck}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="É motorista parceiro?"
                texto="Fale com nossa equipe para suporte e informações."
                botaoTexto="Entrar em Contato"
                link="/contato"
            />
        </Layout>
    )
}

export default Motorista

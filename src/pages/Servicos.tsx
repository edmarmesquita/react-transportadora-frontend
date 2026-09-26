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
                titulo="Recursos da plataforma"
                subtitulo="Ferramentas para dar controle, visibilidade e fluidez à operação de transportes."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Uma operação conectada</h2>
                        <p>Recursos práticos para a rotina de quem administra transportadoras.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Gestão de cargas"
                            descricao="Organize cadastros, responsáveis, status e informações da operação."
                            Icone={FaBox}
                        />

                        <InfoCard
                            titulo="Viagens e recursos"
                            descricao="Planeje viagens e associe veículos e motoristas com regras operacionais claras."
                            Icone={FaTruck}
                        />

                        <InfoCard
                            titulo="Rastreamento público"
                            descricao="Compartilhe atualizações de viagem de forma simples com clientes da transportadora."
                            Icone={FaMapMarkedAlt}
                        />

                        <InfoCard
                            titulo="Segurança e auditoria"
                            descricao="Apoie sua equipe com perfis de acesso, histórico e registros da operação."
                            Icone={FaShieldAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Pronto para digitalizar sua operação?"
                texto="Veja como a ROTANZA se adapta à rotina da sua transportadora."
                botaoTexto="Solicitar demonstração"
                link="/orcamento"
            />
        </Layout>
    )
}

export default Servicos

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
                titulo="Ecossistema"
                subtitulo="Apoio para implantar e evoluir a gestão da sua transportadora."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Uma plataforma que acompanha sua operação</h2>

                        <p>
                            A ROTANZA foi pensada para integrar as pessoas e os processos que mantêm a operação em movimento.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Implantação"
                            descricao="Estruture a plataforma conforme a rotina e os perfis da sua transportadora."
                            Icone={FaTruckMoving}
                        />

                        <InfoCard
                            titulo="Processos conectados"
                            descricao="Padronize informações de cargas, viagens e recursos entre as equipes."
                            Icone={FaBuilding}
                        />

                        <InfoCard
                            titulo="Visibilidade"
                            descricao="Amplie a comunicação com clientes e motoristas durante a execução das viagens."
                            Icone={FaHandshake}
                        />

                        <InfoCard
                            titulo="Evolução contínua"
                            descricao="Use uma base organizada para acompanhar resultados e melhorar decisões."
                            Icone={FaUsers}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Conheça a ROTANZA para a sua operação."
                texto="Solicite uma demonstração e explore os recursos da plataforma."
                botaoTexto="Solicitar demonstração"
                link="/orcamento"
            />
        </Layout>
    )
}

export default Parceiros

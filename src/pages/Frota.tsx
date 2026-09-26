import Layout from "../components/layout/Layout"

import PageBanner from "../components/ui/PageBanner"
import FleetInfoCard from "../components/ui/FleetInfoCard"

import CTASection from "../components/ui/CTASection"

function Frota() {
    return (
        <Layout>
            <PageBanner
                titulo="Gestão de frota"
                subtitulo="Visibilidade para veículos, motoristas e disponibilidade operacional."
            />

            <section className="fleet-info-section public-section-compact">
                <div className="container-central">
                    <div className="fleet-info-grid">
                        <FleetInfoCard
                            titulo="Veículos centralizados"
                            descricao="Cadastre e consulte os dados da frota da sua transportadora em uma única tela."
                        />

                        <FleetInfoCard
                            titulo="Disponibilidade operacional"
                            descricao="Tenha clareza sobre recursos disponíveis, ocupados e liberados para novas viagens."
                        />

                        <FleetInfoCard
                            titulo="Motoristas integrados"
                            descricao="Conecte equipes, viagens e ocorrências para acompanhar a execução da operação."
                        />

                        <FleetInfoCard
                            titulo="Decisões com contexto"
                            descricao="Use informações atualizadas para planejar rotas, alocações e prioridades."
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="A sua frota, sob seu controle."
                texto="Use a ROTANZA para conectar recursos e manter a operação em movimento."
                botaoTexto="Conhecer os recursos"
                link="/servicos"
            />
        </Layout>
    )
}

export default Frota

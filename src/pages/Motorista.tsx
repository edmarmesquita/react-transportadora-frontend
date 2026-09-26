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
                titulo="Portal do Motorista"
                subtitulo="Um recurso da transportadora para manter a equipe conectada à operação."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Informações para quem está na estrada</h2>

                        <p>
                            A ROTANZA permite que cada transportadora compartilhe viagens e atualizações com motoristas cadastrados.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Rotas"
                            descricao="Consulte as viagens e etapas atribuídas pela sua transportadora."
                            Icone={FaRoute}
                        />

                        <InfoCard
                            titulo="Checklist"
                            descricao="Acompanhe ocorrências e atualizações necessárias durante a operação."
                            Icone={FaClipboardCheck}
                        />

                        <InfoCard
                            titulo="Cadastro"
                            descricao="Mantenha suas informações acessíveis no portal disponibilizado pela transportadora."
                            Icone={FaIdCard}
                        />

                        <InfoCard
                            titulo="Veículo"
                            descricao="Visualize os recursos vinculados às viagens que você executa."
                            Icone={FaTruck}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Já recebeu seu acesso?"
                texto="Entre com as credenciais fornecidas pela sua transportadora."
                botaoTexto="Acessar o sistema"
                link="/admin/login"
            />
        </Layout>
    )
}

export default Motorista

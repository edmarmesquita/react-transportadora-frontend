import {
    FaBoxOpen,
    FaClipboardList,
    FaFileInvoice,
    FaUserShield,
} from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Cliente() {
    return (
        <Layout>
            <PageBanner
                titulo="Portal do Cliente"
                subtitulo="Um recurso da transportadora para compartilhar visibilidade com seus clientes."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Transparência para quem acompanha a operação</h2>

                        <p>
                            A ROTANZA permite que cada transportadora ofereça informações atualizadas aos clientes cadastrados.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Rastreamento"
                            descricao="Acompanhe o status das cargas vinculadas à sua transportadora."
                            Icone={FaBoxOpen}
                        />

                        <InfoCard
                            titulo="Histórico"
                            descricao="Consulte o histórico das operações disponibilizadas pela sua transportadora."
                            Icone={FaClipboardList}
                        />

                        <InfoCard
                            titulo="Documentos"
                            descricao="Acesse comprovantes e informações compartilhadas pela operação."
                            Icone={FaFileInvoice}
                        />

                        <InfoCard
                            titulo="Segurança"
                            descricao="Acesso protegido, definido pela transportadora responsável pela operação."
                            Icone={FaUserShield}
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

export default Cliente

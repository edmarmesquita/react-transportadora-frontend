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
                titulo="Área do Cliente"
                subtitulo="Acompanhe informações importantes da sua carga."
            />

            <section className="cards-section">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Serviços ao Cliente</h2>

                        <p>
                            Mais controle, transparência e praticidade para nossos clientes.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Rastreamento"
                            descricao="Acompanhe o status da carga em tempo real."
                            Icone={FaBoxOpen}
                        />

                        <InfoCard
                            titulo="Histórico"
                            descricao="Consulte entregas e operações anteriores."
                            Icone={FaClipboardList}
                        />

                        <InfoCard
                            titulo="Documentos"
                            descricao="Acesso rápido a comprovantes e informações da carga."
                            Icone={FaFileInvoice}
                        />

                        <InfoCard
                            titulo="Segurança"
                            descricao="Área protegida para clientes cadastrados."
                            Icone={FaUserShield}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Precisa acessar suas informações?"
                texto="Entre em contato com nossa equipe de atendimento."
                botaoTexto="Falar com a Equipe"
                link="/contato"
            />
        </Layout>
    )
}

export default Cliente
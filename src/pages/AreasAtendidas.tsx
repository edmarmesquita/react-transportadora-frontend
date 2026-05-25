import { FaMapMarkerAlt, FaRoad, FaWarehouse } from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function AreasAtendidas() {
    return (
        <Layout>
            <PageBanner
                titulo="Áreas Atendidas"
                subtitulo="Transporte estratégico para diferentes regiões do Brasil."
            />

            <section className="cards-section">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Onde Atendemos</h2>
                        <p>Operações planejadas para garantir agilidade e segurança.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Sudeste"
                            descricao="Atendimento em São Paulo, Rio de Janeiro, Minas Gerais e Espírito Santo."
                            Icone={FaMapMarkerAlt}
                        />

                        <InfoCard
                            titulo="Centro-Oeste"
                            descricao="Rotas para Goiás, Distrito Federal, Mato Grosso e Mato Grosso do Sul."
                            Icone={FaRoad}
                        />

                        <InfoCard
                            titulo="Operações Nacionais"
                            descricao="Soluções de transporte para cargas fracionadas e lotação."
                            Icone={FaWarehouse}
                        />

                        <InfoCard
                            titulo="Sul"
                            descricao="Atendimento para Paraná, Santa Catarina e Rio Grande do Sul."
                            Icone={FaMapMarkerAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Quer saber se atendemos sua região?"
                texto="Entre em contato e consulte uma rota personalizada."
                botaoTexto="Solicitar Cotação"
                link="/#cotacao"
            />
        </Layout>
    )
}

export default AreasAtendidas
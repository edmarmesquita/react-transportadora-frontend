import { FaMapMarkerAlt, FaRoad, FaWarehouse } from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function AreasAtendidas() {
    return (
        <Layout>
            <PageBanner
                titulo="Operação conectada"
                subtitulo="A ROTANZA acompanha a rotina da sua transportadora onde ela estiver."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Recursos para toda a operação</h2>
                        <p>Uma plataforma única para equipes que precisam trabalhar com informação atualizada.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Administração"
                            descricao="Acompanhe cadastros, permissões, indicadores e registros da operação."
                            Icone={FaMapMarkerAlt}
                        />

                        <InfoCard
                            titulo="Operação"
                            descricao="Organize cargas, viagens, motoristas e veículos em fluxos conectados."
                            Icone={FaRoad}
                        />

                        <InfoCard
                            titulo="Clientes"
                            descricao="Ofereça portal, rastreamento e comprovantes para melhorar a transparência."
                            Icone={FaWarehouse}
                        />

                        <InfoCard
                            titulo="Motoristas"
                            descricao="Facilite o acesso a viagens, ocorrências e atualizações de localização."
                            Icone={FaMapMarkerAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Leve mais controle para a sua transportadora."
                texto="Conheça os recursos da ROTANZA para conectar toda a operação."
                botaoTexto="Ver recursos"
                link="/servicos"
            />
        </Layout>
    )
}

export default AreasAtendidas

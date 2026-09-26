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
                titulo="A plataforma ROTANZA"
                subtitulo="Tecnologia para organizar e acompanhar operações de transporte."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Quem Somos</h2>
                        <p>
                            A ROTANZA é uma plataforma para gestão e acompanhamento
                            de operações de transporte, com visibilidade, segurança
                            e eficiência em cada etapa.
                        </p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="Nossa missão"
                            descricao="Simplificar a gestão de transportes para que cada equipe opere com mais controle e previsibilidade."
                            Icone={FaTruck}
                        />

                        <InfoCard
                            titulo="Segurança"
                            descricao="Acessos por perfil e registros operacionais para apoiar uma rotina confiável."
                            Icone={FaShieldAlt}
                        />

                        <InfoCard
                            titulo="Tecnologia"
                            descricao="Informações de cargas, viagens e ocorrências reunidas em um só lugar."
                            Icone={FaMapMarkedAlt}
                        />

                        <InfoCard
                            titulo="Atendimento"
                            descricao="Uma plataforma pensada para apoiar administradores, operadores, motoristas e clientes."
                            Icone={FaHandshake}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Conheça a ROTANZA"
                texto="Centralize a gestão das suas operações e acompanhe cada entrega com mais clareza."
                botaoTexto="Solicitar demonstração"
                link="/orcamento"
            />
        </Layout>
    )
}

export default Sobre

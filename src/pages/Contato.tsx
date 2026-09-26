import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa"

import Layout from "../components/layout/Layout"
import PageBanner from "../components/ui/PageBanner"
import InfoCard from "../components/ui/InfoCard"
import CTASection from "../components/ui/CTASection"

function Contato() {
    return (
        <Layout>
            <PageBanner
                titulo="Contato"
                subtitulo="Conheça a plataforma para gestão de transportes."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Como podemos ajudar</h2>
                        <p>Escolha o melhor momento da sua operação para conhecer a ROTANZA.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="WhatsApp"
                            descricao="Converse sobre os desafios operacionais da sua transportadora."
                            Icone={FaWhatsapp}
                        />

                        <InfoCard
                            titulo="Telefone"
                            descricao="Apresente sua operação em uma demonstração orientada ao seu contexto."
                            Icone={FaPhoneAlt}
                        />

                        <InfoCard
                            titulo="E-mail"
                            descricao="Compartilhe os recursos que sua equipe precisa centralizar."
                            Icone={FaEnvelope}
                        />

                        <InfoCard
                            titulo="Implantação"
                            descricao="Planeje o início da plataforma com segurança e clareza para sua equipe."
                            Icone={FaMapMarkerAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Quer ver a ROTANZA em ação?"
                texto="Envie uma solicitação de demonstração pelo formulário da plataforma."
                botaoTexto="Solicitar demonstração"
                link="/orcamento"
            />
        </Layout>
    )
}

export default Contato

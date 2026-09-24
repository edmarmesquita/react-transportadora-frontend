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
                subtitulo="Fale conosco e solicite sua cotação."
            />

            <section className="cards-section public-section-compact">
                <div className="container-central">
                    <div className="section-title">
                        <h2>Canais de Atendimento</h2>
                        <p>Estamos prontos para atender você.</p>
                    </div>

                    <div className="cards-grid">
                        <InfoCard
                            titulo="WhatsApp"
                            descricao="Atendimento rápido para orçamentos e dúvidas."
                            Icone={FaWhatsapp}
                        />

                        <InfoCard
                            titulo="Telefone"
                            descricao="Fale diretamente com nossa equipe comercial."
                            Icone={FaPhoneAlt}
                        />

                        <InfoCard
                            titulo="E-mail"
                            descricao="Envie sua solicitação e retornaremos em breve."
                            Icone={FaEnvelope}
                        />

                        <InfoCard
                            titulo="Localização"
                            descricao="Base estratégica para operações logísticas."
                            Icone={FaMapMarkerAlt}
                        />
                    </div>
                </div>
            </section>

            <CTASection
                titulo="Precisa de atendimento agora?"
                texto="Fale com nossa equipe e receba orientação personalizada."
                botaoTexto="Chamar no WhatsApp"
                link="https://wa.me/5511999999999"
            />
        </Layout>
    )
}

export default Contato

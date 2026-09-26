import Layout from "../components/layout/Layout"

import PageBanner from "../components/ui/PageBanner"
import QuoteSection from "../components/home/QuoteSection"

function Orcamento() {
    return (
        <Layout>
            <PageBanner
                titulo="Solicite uma demonstração"
                subtitulo="Conte um pouco sobre a sua transportadora e conheça a plataforma ROTANZA."
            />

            <QuoteSection className="public-section-compact" />
        </Layout>
    )
}

export default Orcamento

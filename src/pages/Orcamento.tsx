import Layout from "../components/layout/Layout"

import PageBanner from "../components/ui/PageBanner"
import QuoteSection from "../components/home/QuoteSection"

function Orcamento() {
    return (
        <Layout>
            <PageBanner
                titulo="Solicitar Orçamento"
                subtitulo="Preencha os dados e nossa equipe entrará em contato."
            />

            <QuoteSection />
        </Layout>
    )
}

export default Orcamento

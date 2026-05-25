type CTASectionProps = {
    titulo: string
    texto: string
    botaoTexto: string
    link: string
}

function CTASection({
    titulo,
    texto,
    botaoTexto,
    link,
}: CTASectionProps) {
    return (
        <section className="cta-section">
            <div className="container-central">
                <h2>{titulo}</h2>

                <p>{texto}</p>

                <a href={link} className="btn-hero">
                    {botaoTexto}
                </a>
            </div>
        </section>
    )
}

export default CTASection
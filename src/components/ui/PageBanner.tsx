type PageBannerProps = {
    titulo: string
    subtitulo: string
}

function PageBanner({
    titulo,
    subtitulo,
}: PageBannerProps) {
    return (
        <section className="page-banner">
            <div className="page-banner-overlay">
                <div className="page-banner-content">
                    <h1>{titulo}</h1>

                    <p>{subtitulo}</p>
                </div>
            </div>
        </section>
    )
}

export default PageBanner
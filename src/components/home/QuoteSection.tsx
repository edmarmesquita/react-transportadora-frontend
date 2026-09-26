import QuoteForm from "./QuoteForm"

type QuoteSectionProps = {
    className?: string
}

function QuoteSection({ className = "" }: QuoteSectionProps) {
    const classes = ["quote-section", className].filter(Boolean).join(" ")

    return (
        <section id="demonstracao" className={classes}>
            <div className="quote-container">
                <h2>SOLICITE UMA DEMONSTRAÇÃO</h2>

                <QuoteForm />
            </div>
        </section>
    )
}

export default QuoteSection

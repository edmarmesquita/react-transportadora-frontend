import QuoteForm from "./QuoteForm"

function QuoteSection() {
    return (
        <section id="cotacao" className="quote-section">
            <div className="quote-container">
                <h2>DADOS PARA COTAÇÃO</h2>

                <QuoteForm />
            </div>
        </section>
    )
}

export default QuoteSection
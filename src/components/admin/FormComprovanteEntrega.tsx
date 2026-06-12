import { useState } from "react"

type Props = {
    viagemId: number
}

function FormComprovanteEntrega({ viagemId }: Props) {
    const [recebedor, setRecebedor] = useState("")
    const [observacao, setObservacao] = useState("")
    const [arquivo, setArquivo] = useState<File | null>(null)

    async function salvarComprovante() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${viagemId}/comprovante`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recebedor,
                    observacao,
                }),
            }
        )

        const dados = await resposta.json()

        alert(dados.mensagem)
    }

    async function enviarArquivo() {
        if (!arquivo) {
            alert("Selecione um arquivo.")
            return
        }

        const formData = new FormData()

        formData.append("arquivo", arquivo)

        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${viagemId}/comprovante/arquivo`,
            {
                method: "POST",
                body: formData,
            }
        )

        const dados = await resposta.json()

        alert(dados.mensagem || dados.erro)
    }

    return (
        <div className="grafico-card">
            <h2>Comprovante de Entrega</h2>

            <div className="admin-form">
                <input
                    placeholder="Nome do recebedor"
                    value={recebedor}
                    onChange={(e) => setRecebedor(e.target.value)}
                />

                <textarea
                    placeholder="Observações"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={4}
                />

                <button
                    className="btn-primary"
                    onClick={salvarComprovante}
                >
                    Salvar Comprovante
                </button>

                <hr />

                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) =>
                        setArquivo(e.target.files?.[0] || null)
                    }
                />

                <button
                    className="btn-primary"
                    onClick={enviarArquivo}
                >
                    Enviar Arquivo
                </button>
            </div>
        </div>
    )
}

export default FormComprovanteEntrega
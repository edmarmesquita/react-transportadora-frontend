import { useEffect, useState } from "react"

type Props = {
    viagemId: number
}

type ArquivoComprovante = {
    id: number
    nome_arquivo: string
    data_upload: string
    url: string
}

function ListaComprovantes({ viagemId }: Props) {
    const [arquivos, setArquivos] = useState<ArquivoComprovante[]>([])

    async function carregarArquivos() {
        const resposta = await fetch(
            `http://127.0.0.1:5000/api/admin/viagens/${viagemId}/comprovantes/arquivos`
        )

        const dados = await resposta.json()

        setArquivos(dados)
    }

    useEffect(() => {
        carregarArquivos()
    }, [])

    return (
        <div className="grafico-card">
            <h2>Arquivos do Comprovante</h2>

            {arquivos.length === 0 ? (
                <p>Nenhum arquivo enviado.</p>
            ) : (
                <div className="lista-arquivos">
                    {arquivos.map((arquivo) => (
                        <div
                            key={arquivo.id}
                            className="arquivo-item"
                        >
                            <div>
                                <strong>{arquivo.nome_arquivo}</strong>

                                <small>
                                    {arquivo.data_upload}
                                </small>
                            </div>

                            <a
                                href={arquivo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-detalhes"
                            >
                                Abrir
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListaComprovantes
import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import { buscarUsuarioLogado } from "../../services/authService";

type Props = {
    viagemId: number
    atualizacao?: number
}

type ArquivoComprovante = {
    id: number
    nome_arquivo: string
    data_upload: string
    url: string
}

function ListaComprovantes({
    viagemId,
    atualizacao = 0,
}: Props) {
    const usuario = buscarUsuarioLogado();
    const [arquivos, setArquivos] = useState<ArquivoComprovante[]>([])

    async function carregarArquivos() {
        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${viagemId}/comprovantes/arquivos`
                : `/api/admin/viagens/${viagemId}/comprovantes/arquivos`;

        const resposta = await apiFetch(endpoint);

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            throw new Error(
                dados?.erro ||
                dados?.msg ||
                "Não foi possível carregar os comprovantes."
            );
        }

        setArquivos(
            Array.isArray(dados) ? dados : []
        );
    }

    useEffect(() => {
        carregarArquivos()
    }, [viagemId, atualizacao])

    return (
        <div className="grafico-card detalhe-viagem-card comprovantes-arquivos-card">
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

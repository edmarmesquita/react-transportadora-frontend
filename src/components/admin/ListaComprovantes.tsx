import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import { buscarUsuarioLogado } from "../../services/authService";
import { abrirArquivoAutenticado } from "../../services/arquivosService";
import { useNotification } from "../ui/NotificationProvider";

type Props = {
    viagemId: number
    atualizacao?: number
}

type ArquivoComprovante = {
    id: number
    nome_arquivo: string
    data_upload: string
    download_endpoint: string
}

function ListaComprovantes({
    viagemId,
    atualizacao = 0,
}: Props) {
    const usuario = buscarUsuarioLogado();
    const motorista = usuario?.perfil?.toLowerCase() === "motorista";
    const { notificar } = useNotification();
    const [arquivos, setArquivos] = useState<ArquivoComprovante[]>([])

    async function abrirArquivo(downloadEndpoint: string) {
        try {
            await abrirArquivoAutenticado(downloadEndpoint);
        } catch (erro) {
            notificar("erro",
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível abrir o arquivo."
            );
        }
    }

    useEffect(() => {
        let ativo = true;

        async function carregarArquivos() {
            const endpoint = motorista
                ? `/api/motorista/minhas-viagens/${viagemId}/comprovantes/arquivos`
                : `/api/admin/viagens/${viagemId}/comprovantes/arquivos`;

            try {
                const resposta = await apiFetch(endpoint);
                const dados = await resposta.json().catch(() => null);

                if (!resposta.ok) {
                    throw new Error(dados?.erro || dados?.msg || "Não foi possível carregar os comprovantes.");
                }

                if (ativo) setArquivos(Array.isArray(dados) ? dados : []);
            } catch (erro) {
                if (ativo) {
                    notificar("erro", erro instanceof Error ? erro.message : "Não foi possível carregar os comprovantes.");
                }
            }
        }

        void carregarArquivos();
        // Uma consulta anterior ao upload não deve sobrescrever a lista atualizada.
        return () => { ativo = false; };
    }, [viagemId, atualizacao, motorista, notificar])

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

                            <button
                                type="button"
                                onClick={() => abrirArquivo(arquivo.download_endpoint)}
                                className="btn-detalhes"
                            >
                                Abrir
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListaComprovantes

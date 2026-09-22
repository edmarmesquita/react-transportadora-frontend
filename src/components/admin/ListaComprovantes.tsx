import { abrirArquivoAutenticado } from "../../services/arquivosService";
import { useNotification } from "../ui/NotificationProvider";

type Props = {
    arquivos: ArquivoComprovante[]
}

export type ArquivoComprovante = {
    id: number
    nome_arquivo: string
    data_upload: string
    download_endpoint: string
}

function ListaComprovantes({
    arquivos,
}: Props) {
    const { notificar } = useNotification();

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

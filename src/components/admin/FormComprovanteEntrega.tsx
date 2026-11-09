import { useRef, useState } from "react"

import { apiFetch } from "../../services/api"
import { buscarUsuarioLogado } from "../../services/authService";
import { useNotification } from "../ui/NotificationContext";

type Props = {
    viagemId: number
    onFinalizada?: () => void
    onArquivoEnviado?: () => void | Promise<void>
}

function FormComprovanteEntrega({
    viagemId,
    onFinalizada,
    onArquivoEnviado,
}: Props) {
    const { notificar } = useNotification();
    const usuario = buscarUsuarioLogado();
    const [recebedor, setRecebedor] = useState("")
    const [observacao, setObservacao] = useState("")
    const [arquivo, setArquivo] =
        useState<File | null>(null)
    const inputArquivo = useRef<HTMLInputElement>(null)

    const [finalizando, setFinalizando] =
        useState(false)

    const [confirmacaoAberta, setConfirmacaoAberta] =
        useState(false)

    const [enviandoArquivo, setEnviandoArquivo] =
        useState(false)

    async function executarFinalizacao() {
        if (!recebedor.trim()) {
            notificar(
                "aviso",
                "Informe o nome do recebedor."
            )
            return
        }

        try {
            setFinalizando(true)
            setConfirmacaoAberta(false)

            const endpoint =
                usuario?.perfil?.toLowerCase() === "motorista"
                    ? `/api/motorista/minhas-viagens/${viagemId}/finalizar`
                    : `/api/admin/viagens/${viagemId}/finalizar`;

            const resposta = await apiFetch(
                endpoint,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        recebedor: recebedor.trim(),
                        observacao: observacao.trim(),
                    }),
                }
            );

            const dados =
                await resposta.json().catch(() => null)

            if (!resposta.ok) {
                const tipo = resposta.status === 409 || resposta.status === 403
                    ? "aviso"
                    : "erro"

                notificar(
                    tipo,
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível finalizar a entrega."
                )
                return
            }

            notificar(
                "sucesso",
                dados?.mensagem ||
                "Entrega finalizada com sucesso!"
            )

            setRecebedor("")
            setObservacao("")

            onFinalizada?.()
        } catch (erro) {
            notificar(
                "erro",
                erro instanceof Error
                    ? erro.message
                    : "Erro ao conectar com o servidor."
            )
        } finally {
            setFinalizando(false)
        }
    }

    function finalizarEntrega() {
        if (!recebedor.trim()) {
            notificar("aviso", "Informe o nome do recebedor.")
            return
        }

        setConfirmacaoAberta(true)
    }
    async function enviarArquivo() {
        if (!arquivo) {
            notificar("aviso", "Selecione um arquivo.");
            return;
        }

        try {
            setEnviandoArquivo(true);

            const formData = new FormData();

            formData.append(
                "arquivo",
                arquivo
            );

            const endpoint =
                usuario?.perfil?.toLowerCase() === "motorista"
                    ? `/api/motorista/minhas-viagens/${viagemId}/comprovante/arquivo`
                    : `/api/admin/viagens/${viagemId}/comprovante/arquivo`;

            const resposta = await apiFetch(
                endpoint,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const dados =
                await resposta.json().catch(() => null);

            if (!resposta.ok) {
                notificar(
                    "erro",
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível enviar o arquivo."
                );
                return;
            }

            notificar("sucesso", "Arquivo do comprovante enviado com sucesso!");

            setArquivo(null);
            if (inputArquivo.current) inputArquivo.current.value = "";
            await onArquivoEnviado?.();
        } catch (erro) {
            if (erro instanceof Error) {
                notificar("erro", erro.message);
            } else {
                notificar("erro",
                    "Erro ao enviar o arquivo."
                );
            }
        } finally {
            setEnviandoArquivo(false);
        }
    }

    return (
        <div className="grafico-card detalhe-viagem-card finalizar-entrega-card">
            <h2>Finalizar Entrega</h2>

            <p>
                Registre o recebedor e conclua a
                operação da viagem.
            </p>

            <div className="admin-form detalhe-viagem-form">
                <label htmlFor="recebedor">
                    Nome do recebedor
                </label>

                <input
                    id="recebedor"
                    name="recebedor"
                    type="text"
                    placeholder="Nome do recebedor"
                    autoComplete="name"
                    value={recebedor}
                    onChange={(event) =>
                        setRecebedor(
                            event.target.value
                        )
                    }
                    disabled={finalizando}
                />

                <label htmlFor="observacao-entrega">
                    Observações
                </label>

                <textarea
                    id="observacao-entrega"
                    name="observacao"
                    placeholder="Observações da entrega"
                    value={observacao}
                    onChange={(event) =>
                        setObservacao(
                            event.target.value
                        )
                    }
                    rows={4}
                    disabled={finalizando}
                />

                <button
                    type="button"
                    className="btn-primary"
                    onClick={finalizarEntrega}
                    disabled={finalizando}
                >
                    {finalizando
                        ? "Finalizando entrega..."
                        : "Finalizar Entrega"}
                </button>


                {confirmacaoAberta && (
                    <div className="confirmacao-entrega" role="dialog" aria-modal="true" aria-labelledby="confirmacao-entrega-titulo" aria-describedby="confirmacao-entrega-mensagem">
                        <div className="confirmacao-entrega-conteudo">
                            <h3 id="confirmacao-entrega-titulo">Confirmar finaliza&ccedil;&atilde;o</h3>
                            <p id="confirmacao-entrega-mensagem">
                                Deseja realmente finalizar esta entrega? O motorista e o ve&iacute;culo ser&atilde;o liberados.
                            </p>
                            <div className="confirmacao-entrega-acoes">
                                <button
                                    type="button"
                                    className="confirmacao-entrega-cancelar"
                                    onClick={() => setConfirmacaoAberta(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => void executarFinalizacao()}
                                >
                                    Confirmar entrega
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <hr />

                <label htmlFor="arquivo-comprovante">
                    Arquivo do comprovante
                </label>

                <input
                    id="arquivo-comprovante"
                    ref={inputArquivo}
                    name="arquivo-comprovante"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(event) =>
                        setArquivo(
                            event.target.files?.[0] ||
                            null
                        )
                    }
                    disabled={enviandoArquivo}
                />

                <button
                    type="button"
                    className="btn-primary"
                    onClick={enviarArquivo}
                    disabled={
                        enviandoArquivo || !arquivo
                    }
                >
                    {enviandoArquivo
                        ? "Enviando arquivo..."
                        : "Enviar Arquivo"}
                </button>
            </div>
        </div>
    )
}

export default FormComprovanteEntrega

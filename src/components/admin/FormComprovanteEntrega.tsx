import { useState } from "react"

import { apiFetch } from "../../services/api"
import { buscarUsuarioLogado } from "../../services/authService";
import { useNotification } from "../ui/NotificationProvider";

type Props = {
    viagemId: number
    onFinalizada?: () => void
    onArquivoEnviado?: () => void
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

    const [finalizando, setFinalizando] =
        useState(false)

    const [enviandoArquivo, setEnviandoArquivo] =
        useState(false)

    const [erro, setErro] = useState("")

    async function finalizarEntrega() {
        if (!recebedor.trim()) {
            notificar(
                "aviso",
                "Informe o nome do recebedor."
            )
            return
        }

        const confirmar = window.confirm(
            "Deseja realmente finalizar esta entrega? " +
            "O motorista e o veículo serão liberados."
        )

        if (!confirmar) {
            return
        }

        try {
            setFinalizando(true)
            setErro("")

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

    async function enviarArquivo() {
        if (!arquivo) {
            setErro("Selecione um arquivo.");
            return;
        }

        try {
            setEnviandoArquivo(true);
            setErro("");

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

            alert(
                dados.mensagem ||
                "Arquivo enviado com sucesso!"
            );

            setArquivo(null);
            onArquivoEnviado?.();
        } catch (erro) {
            if (erro instanceof Error) {
                setErro(erro.message);
            } else {
                setErro(
                    "Erro ao enviar o arquivo."
                );
            }
        } finally {
            setEnviandoArquivo(false);
        }
    }

    return (
        <div className="grafico-card">
            <h2>Finalizar Entrega</h2>

            <p>
                Registre o recebedor e conclua a
                operação da viagem.
            </p>

            {erro && (
                <div className="mensagem-erro">
                    {erro}
                </div>
            )}

            <div className="admin-form">
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

                <hr />

                <label htmlFor="arquivo-comprovante">
                    Arquivo do comprovante
                </label>

                <input
                    id="arquivo-comprovante"
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

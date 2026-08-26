import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "../services/api"
import AdminLayout from "../components/admin/AdminLayout"
import FormComprovanteEntrega from "../components/admin/FormComprovanteEntrega"
import ListaComprovantes from "../components/admin/ListaComprovantes"
import RastreamentoViagem from "../components/admin/RastreamentoViagem"
import { buscarUsuarioLogado } from "../services/authService";
import { useNotification } from "../components/ui/NotificationProvider";

type Historico = {
    id: number
    status: string
    observacao: string
    data_evento: string
}

type ViagemDetalhe = {
    id: number
    codigo_carga: string
    cliente: string
    motorista: string
    veiculo: string
    origem: string
    destino: string
    status: string
    data_criacao: string
}

type ComprovanteEntrega = {
    recebedor: string
    observacao: string
    data_entrega: string
}

function DetalheViagem() {
    const { id } = useParams()
    const { notificar } = useNotification()

    const [historico, setHistorico] = useState<Historico[]>([])
    const [viagem, setViagem] = useState<ViagemDetalhe | null>(null)
    const [novoStatus, setNovoStatus] = useState("")
    const [novaOcorrencia, setNovaOcorrencia] = useState("")
    const [comprovante, setComprovante] =
        useState<ComprovanteEntrega | null>(null)
    const [atualizacaoArquivos, setAtualizacaoArquivos] = useState(0)
    const usuario = buscarUsuarioLogado();

    async function atualizarStatus() {
        if (!novoStatus) return;

        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/status`
                : `/api/admin/viagens/${id}/status`;

        const resposta = await apiFetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: novoStatus,
                }),
            }
        );

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            notificar(
                resposta.status === 409 ? "aviso" : "erro",
                dados?.erro ||
                dados?.msg ||
                "Não foi possível atualizar o status."
            );
            return;
        }

        setNovoStatus("");

        await Promise.all([
            carregarViagem(),
            carregarHistorico(),
        ]);

        notificar(
            "sucesso",
            dados?.mensagem || "Status atualizado com sucesso."
        )
    }

    async function carregarHistorico() {
        const endpoint =
            usuario?.perfil?.trim().toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/historico`
                : `/api/admin/viagens/${id}/historico`

        const resposta = await apiFetch(
            endpoint
        )

        const dados = await resposta.json().catch(() => null)

        if (!resposta.ok) {
            setHistorico([])
            return
        }

        setHistorico(Array.isArray(dados) ? dados : [])
    }

    async function carregarViagem() {
        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}`
                : `/api/admin/viagens/${id}`;

        const resposta = await apiFetch(endpoint);

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            throw new Error(
                dados?.erro ||
                dados?.msg ||
                "Não foi possível carregar a viagem."
            );
        }

        setViagem(dados);
    }

    async function carregarComprovante() {
        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/comprovante`
                : `/api/admin/viagens/${id}/comprovante`

        const resposta = await apiFetch(endpoint)

        const dados = await resposta.json().catch(() => null)

        if (!resposta.ok) {
            setComprovante(null)
            return
        }

        if (dados?.recebedor) {
            setComprovante(dados)
        } else {
            setComprovante(null)
        }
    }

    async function registrarOcorrencia() {
        if (!novaOcorrencia.trim()) return;

        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/ocorrencias`
                : `/api/admin/viagens/${id}/ocorrencias`;

        const resposta = await apiFetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    descricao: novaOcorrencia.trim(),
                }),
            }
        );

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            alert(
                dados?.erro ||
                dados?.msg ||
                "Não foi possível registrar a ocorrência."
            );
            return;
        }

        setNovaOcorrencia("");

        await Promise.all([
            carregarHistorico(),
        ]);
    }

    useEffect(() => {
        carregarViagem()
        carregarHistorico()
        carregarComprovante()
    }, [])
    return (
        <AdminLayout>
            <div className="admin-page detalhe-viagem-page">
                <div className="page-header">
                    <div>
                        <h1>Detalhes da Viagem</h1>
                        <p>Timeline operacional da viagem</p>
                    </div>
                </div>

                {viagem && (
                    <>
                        <FormComprovanteEntrega
                            viagemId={Number(id)}
                            onFinalizada={() => {
                                carregarViagem();
                                carregarHistorico();
                                carregarComprovante();
                            }}
                            onArquivoEnviado={() =>
                                setAtualizacaoArquivos((valor) => valor + 1)
                            }
                        />

                        {comprovante && (
                            <div className="grafico-card">
                                <h2>Comprovante de Entrega</h2>

                                <p>
                                    <strong>Recebedor:</strong>{" "}
                                    {comprovante.recebedor}
                                </p>

                                <p>
                                    <strong>Data da entrega:</strong>{" "}
                                    {comprovante.data_entrega}
                                </p>

                                <p>
                                    <strong>Observação:</strong>{" "}
                                    {comprovante.observacao || "-"}
                                </p>
                            </div>
                        )}

                        <ListaComprovantes
                            viagemId={Number(id)}
                            atualizacao={atualizacaoArquivos}
                        />

                        <RastreamentoViagem
                            viagemId={Number(id)}
                        />

                        <div className="viagem-info-box">
                            <h2>{viagem.codigo_carga}</h2>

                            <p>
                                <strong>Cliente:</strong>{" "}
                                {viagem.cliente}
                            </p>

                            <p>
                                <strong>Motorista:</strong>{" "}
                                {viagem.motorista || "Não definido"}
                            </p>

                            <p>
                                <strong>Veículo:</strong>{" "}
                                {viagem.veiculo || "Não definido"}
                            </p>

                            <p>
                                <strong>Origem:</strong>{" "}
                                {viagem.origem}
                            </p>

                            <p>
                                <strong>Destino:</strong>{" "}
                                {viagem.destino}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {viagem.status}
                            </p>
                        </div>

                        <div className="status-box">
                            <select
                                value={novoStatus}
                                onChange={(e) =>
                                    setNovoStatus(e.target.value)
                                }
                            >
                                <option value="">
                                    Alterar status
                                </option>

                                <option value="Em coleta">
                                    Em coleta
                                </option>

                                <option value="Carregando">
                                    Carregando
                                </option>

                                <option value="Em trânsito">
                                    Em trânsito
                                </option>

                                <option value="Parada operacional">
                                    Parada operacional
                                </option>

                                <option value="Saiu para entrega">
                                    Saiu para entrega
                                </option>

                                {usuario?.perfil?.toLowerCase() !==
                                    "motorista" && (
                                        <option value="Cancelada">
                                            Cancelada
                                        </option>
                                    )}
                            </select>

                            <button
                                className="btn-nova-carga"
                                onClick={atualizarStatus}
                            >
                                Atualizar
                            </button>
                        </div>

                        <div className="ocorrencia-box">
                            <textarea
                                placeholder="Registrar ocorrência..."
                                value={novaOcorrencia}
                                onChange={(e) =>
                                    setNovaOcorrencia(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                className="btn-nova-carga"
                                onClick={registrarOcorrencia}
                            >
                                Registrar Ocorrência
                            </button>
                        </div>

                        <div className="timeline-box">
                            {historico.length === 0 ? (
                                <p>
                                    Nenhum evento registrado nesta viagem.
                                </p>
                            ) : (
                                historico.map((item) => (
                                    <div
                                        className="timeline-item"
                                        key={item.id}
                                    >
                                        <div
                                            className={`timeline-dot ${item.status ===
                                                    "Comprovante anexado"
                                                    ? "dot-arquivo"
                                                    : item.status ===
                                                        "Ocorrência" ||
                                                        item.status ===
                                                        "OCORRÊNCIA"
                                                        ? "dot-ocorrencia"
                                                        : item.status ===
                                                            "Entregue" ||
                                                            item.status ===
                                                            "ENTREGA"
                                                            ? "dot-entregue"
                                                            : item.status ===
                                                                "MOTORISTA"
                                                                ? "dot-motorista"
                                                                : item.status ===
                                                                    "VEÍCULO"
                                                                    ? "dot-veiculo"
                                                                    : item.status ===
                                                                        "STATUS"
                                                                        ? "dot-status"
                                                                        : item.status ===
                                                                            "LOCALIZAÇÃO"
                                                                            ? "dot-localizacao"
                                                                            : ""
                                                }`}
                                        />

                                        <div>
                                            <h3>
                                                {item.status}
                                            </h3>

                                            <p>
                                                {item.observacao ||
                                                    "Evento registrado sem observação."}
                                            </p>

                                            <span>
                                                {item.data_evento}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

export default DetalheViagem

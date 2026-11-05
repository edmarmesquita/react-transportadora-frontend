import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiFetch } from "../services/api"
import AdminLayout from "../components/admin/AdminLayout"
import FormComprovanteEntrega from "../components/admin/FormComprovanteEntrega"
import ListaComprovantes, {
    type ArquivoComprovante,
} from "../components/admin/ListaComprovantes"
import RastreamentoViagem from "../components/admin/RastreamentoViagem"
import PainelOperacionalMotorista from "../components/motorista/PainelOperacionalMotorista"
import { buscarUsuarioLogado } from "../services/authService";
import { useNotification } from "../components/ui/NotificationProvider";
import { transicoesViagem } from "../constants/estadosOperacionais";

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
    data_saida?: string | null
    previsao_entrega?: string | null
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
    const [registrandoOcorrencia, setRegistrandoOcorrencia] = useState(false)
    const [comprovante, setComprovante] =
        useState<ComprovanteEntrega | null>(null)
    const [arquivosComprovante, setArquivosComprovante] =
        useState<ArquivoComprovante[]>([])
    const arquivosRequisicao = useRef(0)
    const [carregando, setCarregando] = useState(true)
    const [erroCarregamento, setErroCarregamento] = useState("")
    const usuario = buscarUsuarioLogado();
    const ehMotorista = usuario?.perfil?.trim().toLowerCase() === "motorista";

    async function atualizarStatus(statusSolicitado = novoStatus): Promise<boolean> {
        if (!statusSolicitado) return false;
        if (ehMotorista && (!viagem || viagem.status === "Saiu para entrega" || statusSolicitado === "Cancelada" || !(transicoesViagem[viagem.status] ?? []).includes(statusSolicitado))) return false;

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
                    status: statusSolicitado,
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
            return false;
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
        return true;
    }

    async function carregarHistorico(): Promise<boolean> {
        const endpoint =
            usuario?.perfil?.trim().toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/historico`
                : `/api/admin/viagens/${id}/historico`

        const resposta = await apiFetch(
            endpoint
        )

        const dados = await resposta.json().catch(() => null)

        if (!resposta.ok) {
            return false
        }

        setHistorico(Array.isArray(dados) ? dados : [])
        return true
    }

    async function atualizarTimelineAposLocalizacao() {
        const atualizou = await carregarHistorico()
        if (!atualizou) {
            throw new Error("Falha ao carregar histórico da viagem.")
        }
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

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados) ||
            !dados.id
        ) {
            throw new Error(
                "Viagem não encontrada ou sem dados disponíveis."
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

    async function carregarArquivosComprovante() {
        const requisicaoAtual = ++arquivosRequisicao.current
        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/comprovantes/arquivos`
                : `/api/admin/viagens/${id}/comprovantes/arquivos`

        try {
            const resposta = await apiFetch(endpoint, { cache: "no-store" })
            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível carregar os comprovantes."
                )
            }

            if (requisicaoAtual === arquivosRequisicao.current) {
                setArquivosComprovante(Array.isArray(dados) ? dados : [])
            }
        } catch (erro) {
            if (requisicaoAtual === arquivosRequisicao.current) {
                notificar(
                    "erro",
                    erro instanceof Error
                        ? erro.message
                        : "Não foi possível carregar os comprovantes."
                )
            }
        }
    }

    async function carregarDados() {
        try {
            await Promise.all([
                carregarViagem(),
                carregarHistorico(),
                carregarComprovante(),
            ])
            await carregarArquivosComprovante()
        } catch (error) {
            setViagem(null)
            setErroCarregamento(
                error instanceof Error
                    ? error.message
                    : "NÃ£o foi possÃ­vel carregar a viagem."
            )
        } finally {
            setCarregando(false)
        }
    }

    async function registrarOcorrencia() {
        if (registrandoOcorrencia) return;
        if (!novaOcorrencia.trim()) {
            notificar("aviso", "Descreva a ocorrência.");
            return;
        }

        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/ocorrencias`
                : `/api/admin/viagens/${id}/ocorrencias`;

        try {
            setRegistrandoOcorrencia(true);
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
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível registrar a ocorrência."
                );
                return;
            }

            setNovaOcorrencia("");
            notificar("sucesso", "Ocorrência registrada com sucesso!");

            await carregarHistorico().catch(() => {
                notificar("aviso", "Ocorrência salva, mas não foi possível atualizar a timeline.");
            });
        } catch {
            notificar("erro", "Erro ao conectar com o servidor.");
        } finally {
            setRegistrandoOcorrencia(false);
        }
    }

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        queueMicrotask(() => {
            void carregarDados()
        })
    }, [])
    /* eslint-enable react-hooks/exhaustive-deps */
    return (
        <AdminLayout>
            <div className="admin-page detalhe-viagem-page">
                {carregando && (
                    <p>Carregando detalhes da viagem...</p>
                )}

                {!carregando && erroCarregamento && (
                    <section className="detalhe-viagem-card" role="alert">
                        <h1 className="detalhe-viagem-erro-titulo">
                            Viagem não encontrada
                        </h1>
                        <p className="mensagem-erro">
                            {erroCarregamento}
                        </p>
                        {usuario?.perfil?.toLowerCase() === "motorista" && (
                            <Link
                                to="/portal/motorista"
                                className="btn-primary"
                            >
                                Voltar para Minhas Viagens
                            </Link>
                        )}
                    </section>
                )}

                {!carregando && !erroCarregamento && viagem && (
                    <div className="detalhe-viagem-container">
                        <div className="carga-detalhe-header detalhe-viagem-header">
                            <div>
                                <span className="carga-detalhe-subtitulo">
                                    Operação de transporte
                                </span>

                                <h1>Detalhes da Viagem</h1>
                                <p>Timeline operacional da viagem</p>
                            </div>

                            {!ehMotorista && <div className="carga-codigo-badge">
                                {viagem.codigo_carga}
                            </div>}
                        </div>

                        {ehMotorista && (
                            <PainelOperacionalMotorista viagem={viagem} onAtualizarStatus={atualizarStatus} />
                        )}

                        <section className="resumo-carga-card viagem-resumo-card">
                            <div className="resumo-carga-topo">
                                <div>
                                    <span className="operacao-label">
                                        Informações da operação
                                    </span>
                                    <h2>Resumo da viagem</h2>
                                </div>

                                {!ehMotorista && <span
                                    className={`status status-${viagem.status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")}`}
                                >
                                    {viagem.status}
                                </span>}
                            </div>

                            <div className="resumo-carga-grid">
                                {!ehMotorista && <div className="resumo-item">
                                    <span>Código</span>
                                    <strong>{viagem.codigo_carga}</strong>
                                </div>}

                                <div className="resumo-item">
                                    <span>Cliente</span>
                                    <strong>{viagem.cliente}</strong>
                                </div>

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Status</span>
                                    <strong>{viagem.status}</strong>
                                </div>}

                                <div className="resumo-item">
                                    <span>Motorista</span>
                                    <strong>{viagem.motorista || "Não definido"}</strong>
                                </div>

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Veículo</span>
                                    <strong>{viagem.veiculo || "Não definido"}</strong>
                                </div>}

                                <div className="resumo-item">
                                    <span>Criada em</span>
                                    <strong>{viagem.data_criacao}</strong>
                                </div>

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Saída real</span>
                                    <strong>{viagem.data_saida || "Não informada"}</strong>
                                </div>}

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Previsão de entrega</span>
                                    <strong>{viagem.previsao_entrega || "Não informada"}</strong>
                                </div>}

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Origem</span>
                                    <strong>{viagem.origem}</strong>
                                </div>}

                                {!ehMotorista && <div className="resumo-item">
                                    <span>Destino</span>
                                    <strong>{viagem.destino}</strong>
                                </div>}
                            </div>
                        </section>

                        {!ehMotorista && <section className="detalhe-viagem-card status-viagem-card">
                            <div>
                                <span className="operacao-label">Situação operacional</span>
                                <h2>Atualizar status</h2>
                            </div>

                            <div className="status-box">
                                <select
                                    value={novoStatus}
                                    onChange={(e) =>
                                        setNovoStatus(e.target.value)
                                    }
                                >
                                    <option value="">Alterar status</option>
                                    {(transicoesViagem[viagem?.status ?? ""] ?? [])
                                        .filter(
                                            (status) => status !== "Cancelada"
                                                || usuario?.perfil?.toLowerCase() !== "motorista"
                                        )
                                        .map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                </select>

                                <button
                                    className="btn-nova-carga"
                                    onClick={() => void atualizarStatus()}
                                >
                                    Atualizar
                                </button>
                            </div>
                        </section>}

                        {comprovante && (
                            <div className="grafico-card detalhe-viagem-card comprovante-resumo-card">
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
                            arquivos={arquivosComprovante}
                        />

                        <RastreamentoViagem
                            viagemId={Number(id)}
                            sectionId={ehMotorista ? "motorista-localizacao" : undefined}
                            onLocalizacaoRegistrada={atualizarTimelineAposLocalizacao}
                        />

                        <div className="ocorrencia-box detalhe-viagem-card" id={ehMotorista ? "motorista-ocorrencia" : undefined} tabIndex={ehMotorista ? -1 : undefined}>
                            <div>
                                <span className="operacao-label">Registro operacional</span>
                                <h2>Adicionar ocorrência</h2>
                            </div>

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
                                disabled={registrandoOcorrencia}
                            >
                                {registrandoOcorrencia ? "Registrando..." : "Registrar Ocorrência"}
                            </button>
                        </div>

                        {viagem?.status === "Saiu para entrega" && (
                            <FormComprovanteEntrega
                                viagemId={Number(id)}
                                onFinalizada={() => {
                                    carregarViagem();
                                    carregarHistorico();
                                    carregarComprovante();
                                }}
                                onArquivoEnviado={async () => {
                                    await carregarArquivosComprovante()
                                    await carregarHistorico().catch(() => {
                                        notificar("aviso", "Arquivo enviado, mas não foi possível atualizar a timeline.")
                                    })
                                }}
                            />
                        )}

                        <div className="timeline-box detalhe-viagem-card">
                            <div className="timeline-titulo">
                                <span className="operacao-label">Histórico operacional</span>
                                <h2>Timeline da viagem</h2>
                            </div>

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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default DetalheViagem

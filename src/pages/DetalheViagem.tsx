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
    estou_chegando?: boolean
    data_aviso_chegada?: string | null
}

type ComprovanteEntrega = {
    recebedor: string
    observacao: string
    data_entrega: string
}

type FotoSelecionada = { id: number; arquivo: File; url: string }
type FotoPersistida = { id: number; nome_original: string; url: string }
type OcorrenciaVisual = { id: number; descricao: string; data: string; data_iso?: string; fotos: FotoPersistida[] }

function formatarInstanteSaoPaulo(valor: string | undefined, fallback: string) {
    if (!valor) return fallback
    const data = new Date(valor)
    if (Number.isNaN(data.getTime())) return fallback
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(data)
}
const LIMITE_FOTO = 10 * 1024 * 1024

function DetalheViagem() {
    const { id } = useParams()
    const { notificar } = useNotification()

    const [historico, setHistorico] = useState<Historico[]>([])
    const [viagem, setViagem] = useState<ViagemDetalhe | null>(null)
    const [novoStatus, setNovoStatus] = useState("")
    const [novaOcorrencia, setNovaOcorrencia] = useState("")
    const [registrandoOcorrencia, setRegistrandoOcorrencia] = useState(false)
    const registroOcorrenciaEmAndamento = useRef(false)
    const [fotosOcorrencia, setFotosOcorrencia] = useState<FotoSelecionada[]>([])
    const fotosRef = useRef<FotoSelecionada[]>([])
    const proximoFotoId = useRef(0)
    const inputFotos = useRef<HTMLInputElement>(null)
    const [ocorrenciaPendenteId, setOcorrenciaPendenteId] = useState<number | null>(null)
    const [etapaOcorrencia, setEtapaOcorrencia] = useState<"registrando" | "fotos" | null>(null)
    const [mensagemFotos, setMensagemFotos] = useState("")
    const [erroFotos, setErroFotos] = useState("")
    const [ocorrenciasVisuais, setOcorrenciasVisuais] = useState<OcorrenciaVisual[]>([])
    const urlsOcorrenciasRef = useRef<string[]>([])
    const [comprovante, setComprovante] =
        useState<ComprovanteEntrega | null>(null)
    const [arquivosComprovante, setArquivosComprovante] =
        useState<ArquivoComprovante[]>([])
    const arquivosRequisicao = useRef(0)
    const [carregando, setCarregando] = useState(true)
    const [enviandoAviso, setEnviandoAviso] = useState(false)
    const [erroAviso, setErroAviso] = useState("")
    const avisoEmAndamento = useRef(false)
    const [erroCarregamento, setErroCarregamento] = useState("")
    const usuario = buscarUsuarioLogado();
    const ehMotorista = usuario?.perfil?.trim().toLowerCase() === "motorista";

    async function avisarChegada() {
        if (!ehMotorista || !viagem || viagem.status !== "Saiu para entrega" || viagem.estou_chegando || avisoEmAndamento.current) return;
        avisoEmAndamento.current = true;
        setEnviandoAviso(true);
        setErroAviso("");
        try {
            const resposta = await apiFetch(`/api/motorista/minhas-viagens/${viagem.id}/estou-chegando`, { method: "POST" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.erro || "Não foi possível avisar o cliente. Tente novamente.");
            setViagem((atual) => atual && atual.id === viagem.id
                ? { ...atual, estou_chegando: true, data_aviso_chegada: dados?.data_aviso ?? atual.data_aviso_chegada }
                : atual);
        } catch (erro) {
            setErroAviso(erro instanceof Error ? erro.message : "Não foi possível avisar o cliente. Tente novamente.");
        } finally {
            avisoEmAndamento.current = false;
            setEnviandoAviso(false);
        }
    }

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

    async function carregarFotosOcorrencias() {
        if (!ehMotorista) return
        const resposta = await apiFetch(`/api/motorista/minhas-viagens/${id}/ocorrencias`, { cache: "no-store" })
        const ocorrencias = await resposta.json().catch(() => null)
        if (!resposta.ok || !Array.isArray(ocorrencias)) return
        for (const url of urlsOcorrenciasRef.current) URL.revokeObjectURL(url)
        urlsOcorrenciasRef.current = []
        const visuais: OcorrenciaVisual[] = []
        for (const ocorrencia of ocorrencias) {
            const fotosResposta = await apiFetch(`/api/motorista/minhas-viagens/${id}/ocorrencias/${ocorrencia.id}/fotos`, { cache: "no-store" })
            const fotos = await fotosResposta.json().catch(() => null)
            const persistidas: FotoPersistida[] = []
            if (fotosResposta.ok && Array.isArray(fotos)) {
                for (const foto of fotos) {
                    try {
                        const download = await apiFetch(foto.download_endpoint)
                        if (!download.ok) continue
                        const url = URL.createObjectURL(await download.blob())
                        urlsOcorrenciasRef.current.push(url)
                        persistidas.push({ id: foto.id, nome_original: foto.nome_original, url })
                    } catch {
                        // Uma foto indisponível não deve interromper a Timeline.
                    }
                }
            }
            visuais.push({
                id: ocorrencia.id,
                descricao: ocorrencia.descricao,
                data: formatarInstanteSaoPaulo(ocorrencia.data_iso, ocorrencia.data),
                data_iso: ocorrencia.data_iso,
                fotos: persistidas,
            })
        }
        setOcorrenciasVisuais(visuais)
    }

    async function carregarDados() {
        try {
            await Promise.all([
                carregarViagem(),
                carregarHistorico(),
                carregarComprovante(),
            ])
            await carregarArquivosComprovante()
            await carregarFotosOcorrencias()
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

    function limparFotos() {
        for (const foto of fotosRef.current) URL.revokeObjectURL(foto.url);
        fotosRef.current = [];
        setFotosOcorrencia([]);
        if (inputFotos.current) inputFotos.current.value = "";
    }

    function selecionarFotos(arquivos: FileList | null) {
        if (!arquivos || registroOcorrenciaEmAndamento.current) return;
        const selecionadas = Array.from(arquivos);
        if (fotosRef.current.length + selecionadas.length > 5) {
            setErroFotos("Selecione no máximo 5 fotos por ocorrência.");
        } else {
            const invalida = selecionadas.find((arquivo) =>
                !["image/jpeg", "image/png"].includes(arquivo.type)
                || !/\.(jpe?g|png)$/i.test(arquivo.name)
                || arquivo.size === 0
                || arquivo.size > LIMITE_FOTO);
            if (invalida) {
                setErroFotos(`Foto inválida: ${invalida.name}. Use JPEG ou PNG de até 10 MiB.`);
            } else {
                const novas = selecionadas.map((arquivo) => ({
                    id: ++proximoFotoId.current, arquivo, url: URL.createObjectURL(arquivo),
                }));
                fotosRef.current = [...fotosRef.current, ...novas];
                setFotosOcorrencia(fotosRef.current);
                setErroFotos("");
            }
        }
        if (inputFotos.current) inputFotos.current.value = "";
    }

    function removerFoto(fotoId: number) {
        if (registroOcorrenciaEmAndamento.current) return;
        const foto = fotosRef.current.find((item) => item.id === fotoId);
        if (foto) URL.revokeObjectURL(foto.url);
        fotosRef.current = fotosRef.current.filter((item) => item.id !== fotoId);
        setFotosOcorrencia(fotosRef.current);
        setErroFotos("");
    }

    async function enviarFotosOcorrencia(ocorrenciaId: number, fotos: FotoSelecionada[]) {
        setEtapaOcorrencia("fotos");
        const corpo = new FormData();
        for (const foto of fotos) corpo.append("fotos", foto.arquivo);
        const resposta = await apiFetch(
            `/api/motorista/minhas-viagens/${id}/ocorrencias/${ocorrenciaId}/fotos`,
            { method: "POST", body: corpo }
        );
        const dados = await resposta.json().catch(() => null);
        if (!resposta.ok) throw new Error(dados?.erro || "Não foi possível enviar as fotos.");
        return dados;
    }

    async function tentarEnviarFotosNovamente() {
        if (ocorrenciaPendenteId === null || registroOcorrenciaEmAndamento.current || fotosRef.current.length === 0) return;
        registroOcorrenciaEmAndamento.current = true;
        setRegistrandoOcorrencia(true);
        setErroFotos("");
        try {
            await enviarFotosOcorrencia(ocorrenciaPendenteId, fotosRef.current);
            setOcorrenciaPendenteId(null);
            setMensagemFotos("Ocorrência registrada. Fotos anexadas.");
            notificar("sucesso", "Ocorrência registrada com sucesso. Fotos anexadas.");
            limparFotos();
        } catch (erro) {
            setErroFotos(erro instanceof Error ? `Ocorrência registrada, mas as fotos ainda não foram enviadas. ${erro.message}` : "Ocorrência registrada, mas as fotos ainda não foram enviadas.");
        } finally {
            registroOcorrenciaEmAndamento.current = false;
            setRegistrandoOcorrencia(false);
            setEtapaOcorrencia(null);
        }
    }

    async function registrarOcorrencia() {
        if (registroOcorrenciaEmAndamento.current || ocorrenciaPendenteId !== null) return;
        if (!novaOcorrencia.trim()) {
            notificar("aviso", "Descreva a ocorrência.");
            return;
        }

        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${id}/ocorrencias`
                : `/api/admin/viagens/${id}/ocorrencias`;

        registroOcorrenciaEmAndamento.current = true;
        setErroFotos("");
        setMensagemFotos("");
        try {
            setRegistrandoOcorrencia(true);
            setEtapaOcorrencia("registrando");
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

            const fotosParaEnviar = [...fotosRef.current];
            setNovaOcorrencia("");
            if (ehMotorista && fotosParaEnviar.length > 0) {
                const ocorrenciaId = Number(dados?.ocorrencia_id);
                if (!Number.isSafeInteger(ocorrenciaId) || ocorrenciaId <= 0) {
                    setErroFotos("Ocorrência registrada, mas o servidor não informou o ID para anexar as fotos.");
                    return;
                }
                setOcorrenciaPendenteId(ocorrenciaId);
                try {
                    await enviarFotosOcorrencia(ocorrenciaId, fotosParaEnviar);
                    setOcorrenciaPendenteId(null);
                    setMensagemFotos("Ocorrência registrada. Fotos anexadas.");
                    notificar("sucesso", "Ocorrência registrada com sucesso. Fotos anexadas.");
                    limparFotos();
                } catch (erro) {
                    setErroFotos(erro instanceof Error ? `Ocorrência registrada, mas não foi possível enviar as fotos. ${erro.message}` : "Ocorrência registrada, mas não foi possível enviar as fotos.");
                }
            } else {
                notificar("sucesso", "Ocorrência registrada com sucesso!");
            }

            await carregarHistorico().catch(() => {
                notificar("aviso", "Ocorrência salva, mas não foi possível atualizar a timeline.");
            });
        } catch {
            notificar("erro", "Erro ao conectar com o servidor.");
        } finally {
            registroOcorrenciaEmAndamento.current = false;
            setRegistrandoOcorrencia(false);
            setEtapaOcorrencia(null);
        }
    }

    useEffect(() => () => {
        for (const foto of fotosRef.current) URL.revokeObjectURL(foto.url);
        fotosRef.current = [];
        for (const url of urlsOcorrenciasRef.current) URL.revokeObjectURL(url);
        urlsOcorrenciasRef.current = [];
    }, []);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        queueMicrotask(() => {
            void carregarDados()
        })
    }, [])
    /* eslint-enable react-hooks/exhaustive-deps */
    return (
        <AdminLayout className={ehMotorista ? "motorista-detalhe-layout" : undefined}>
            <div className={`admin-page detalhe-viagem-page${ehMotorista ? " detalhe-viagem-motorista" : ""}`}>
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
                            <PainelOperacionalMotorista viagem={viagem} onAtualizarStatus={atualizarStatus} onAvisarChegada={avisarChegada} enviandoAviso={enviandoAviso} erroAviso={erroAviso} />
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

                        {ehMotorista && ocorrenciasVisuais.some((ocorrencia) => ocorrencia.fotos.length > 0) && (
                            <section className="ocorrencias-fotos-persistidas detalhe-viagem-card" aria-labelledby="fotos-ocorrencias-titulo">
                                <h2 id="fotos-ocorrencias-titulo">Fotos da ocorrência</h2>
                                {ocorrenciasVisuais.filter((ocorrencia) => ocorrencia.fotos.length > 0).map((ocorrencia) => (
                                    <article key={ocorrencia.id} className="ocorrencia-fotos-item">
                                        <p><strong>{ocorrencia.descricao}</strong></p>
                                        <small>{ocorrencia.data}</small>
                                        <div className="ocorrencia-fotos-grade">
                                            {ocorrencia.fotos.map((foto) => (
                                                <a key={foto.id} href={foto.url} target="_blank" rel="noopener noreferrer">
                                                    <img src={foto.url} alt={`Foto da ocorrência: ${foto.nome_original}`} />
                                                </a>
                                            ))}
                                        </div>
                                    </article>
                                ))}
                            </section>
                        )}

                        <div className="ocorrencia-box detalhe-viagem-card" id={ehMotorista ? "motorista-ocorrencia" : undefined} tabIndex={ehMotorista ? -1 : undefined}>
                            <div>
                                <span className="operacao-label">Registro operacional</span>
                                <h2>Adicionar ocorrência</h2>
                            </div>

                            {ehMotorista && <label htmlFor="motorista-descricao-ocorrencia">Descreva a ocorrência</label>}
                            <textarea
                                id={ehMotorista ? "motorista-descricao-ocorrencia" : undefined}
                                placeholder="Registrar ocorrência..."
                                value={novaOcorrencia}
                                onChange={(e) =>
                                    setNovaOcorrencia(
                                        e.target.value
                                    )
                                }
                                disabled={registrandoOcorrencia || ocorrenciaPendenteId !== null}
                            />

                            {ehMotorista && viagem && ["Em trânsito", "Saiu para entrega"].includes(viagem.status) && (
                                <div className="motorista-fotos-ocorrencia">
                                    <h3>Fotos da ocorrência (opcional)</h3>
                                    <label htmlFor="motorista-fotos-ocorrencia" className="motorista-fotos-adicionar">Adicionar fotos</label>
                                    <input
                                        id="motorista-fotos-ocorrencia"
                                        ref={inputFotos}
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        multiple
                                        onChange={(evento) => selecionarFotos(evento.target.files)}
                                        disabled={registrandoOcorrencia || fotosOcorrencia.length >= 5}
                                    />
                                    <p>{fotosOcorrencia.length} de 5 fotos</p>
                                    {fotosOcorrencia.length > 0 && (
                                        <ul className="motorista-fotos-lista">
                                            {fotosOcorrencia.map((foto) => (
                                                <li key={foto.id}>
                                                    <img src={foto.url} alt={`Prévia de ${foto.arquivo.name}`} />
                                                    <span>{foto.arquivo.name}</span>
                                                    <button type="button" onClick={() => removerFoto(foto.id)} disabled={registrandoOcorrencia} aria-label={`Remover foto ${foto.arquivo.name}`}>Remover</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {erroFotos && <p role="alert">{erroFotos}</p>}
                                    {mensagemFotos && <p role="status">{mensagemFotos}</p>}
                                    {ocorrenciaPendenteId !== null && !registrandoOcorrencia && (
                                        <div className="motorista-fotos-recuperacao">
                                            {fotosOcorrencia.length > 0 && <button type="button" onClick={() => void tentarEnviarFotosNovamente()}>Tentar enviar fotos novamente</button>}
                                            <button type="button" onClick={() => { limparFotos(); setOcorrenciaPendenteId(null); setErroFotos(""); setMensagemFotos("Ocorrência registrada sem fotos."); }}>Concluir sem fotos</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="btn-nova-carga"
                                onClick={registrarOcorrencia}
                                disabled={registrandoOcorrencia || ocorrenciaPendenteId !== null}
                            >
                                {etapaOcorrencia === "registrando" ? "Registrando ocorrência..." : etapaOcorrencia === "fotos" ? "Enviando fotos..." : "Registrar Ocorrência"}
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

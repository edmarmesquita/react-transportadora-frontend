import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Clock3,
    Package,
    TriangleAlert,
    FileCheck2,
} from "lucide-react";

import TimelineRastreamento from "../components/rastreamento/TimelineRastreamento";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";

import {
    buscarDetalheCarga,
    criarOcorrenciaCarga,
    listarOcorrenciasCarga,
    listarComprovantesCarga,
} from "../services/clienteService";
import { abrirArquivoAutenticado } from "../services/arquivosService";

import type {
    DetalheMinhaCarga,
    OcorrenciaCarga,
    ComprovanteCarga,
    ArquivoComprovanteCarga,
} from "../types/minhaCarga";

function DetalheCargaCliente() {
    const { id } = useParams();

    const [carga, setCarga] =
        useState<DetalheMinhaCarga | null>(null);

    const [ocorrencias, setOcorrencias] =
        useState<OcorrenciaCarga[]>([]);

    const [comprovantes, setComprovantes] =
        useState<ComprovanteCarga[]>([]);

    const [arquivosComprovante, setArquivosComprovante] =
        useState<ArquivoComprovanteCarga[]>([]);

    const [erroDownload, setErroDownload] = useState("");

    async function abrirArquivo(downloadEndpoint: string) {
        setErroDownload("");

        try {
            await abrirArquivoAutenticado(downloadEndpoint);
        } catch (error) {
            setErroDownload(
                error instanceof Error
                    ? error.message
                    : "Não foi possível abrir o arquivo."
            );
        }
    }

    const [tituloOcorrencia, setTituloOcorrencia] =
        useState("");

    const [descricaoOcorrencia, setDescricaoOcorrencia] =
        useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvandoOcorrencia, setSalvandoOcorrencia] =
        useState(false);

    const [erro, setErro] = useState("");
    const [erroOcorrencias, setErroOcorrencias] = useState("");
    const [erroComprovantes, setErroComprovantes] = useState("");
    const [mensagemOcorrencia, setMensagemOcorrencia] =
        useState("");

    function obterCargaId(): number {
        const cargaId = Number(id);

        if (!cargaId) {
            throw new Error("Identificador da carga inválido.");
        }

        return cargaId;
    }

    useEffect(() => {
        let ativo = true;
        async function carregarPagina() {
        setCarregando(true);
        setErro("");
        setErroOcorrencias("");
        setErroComprovantes("");
        setCarga(null);
        setOcorrencias([]);
        setComprovantes([]);
        setArquivosComprovante([]);
        try {
            const cargaId = Number(id);
            if (!cargaId) throw new Error("Identificador da carga inválido.");

            const [detalhe, ocorrenciasResultado, comprovantesResultado] = await Promise.allSettled([
                buscarDetalheCarga(cargaId),
                listarOcorrenciasCarga(cargaId),
                listarComprovantesCarga(cargaId),
            ]);
            if (!ativo) return;
            if (detalhe.status === "rejected") throw detalhe.reason;
            setCarga(detalhe.value);
            if (ocorrenciasResultado.status === "fulfilled") {
                setOcorrencias(ocorrenciasResultado.value);
            } else {
                setErroOcorrencias(ocorrenciasResultado.reason instanceof Error ? ocorrenciasResultado.reason.message : "Não foi possível carregar as ocorrências.");
            }
            if (comprovantesResultado.status === "fulfilled") {
                setComprovantes(comprovantesResultado.value.comprovantes);
                setArquivosComprovante(comprovantesResultado.value.arquivos);
            } else {
                setErroComprovantes(comprovantesResultado.reason instanceof Error ? comprovantesResultado.reason.message : "Não foi possível carregar os comprovantes.");
            }
        } catch (error) {
            if (!ativo) return;
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível carregar a carga.");
            }
        } finally {
            if (ativo) setCarregando(false);
        }
        }
        void carregarPagina();
        return () => { ativo = false; };
    }, [id]);

    async function handleCriarOcorrencia(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMensagemOcorrencia("");

        if (!tituloOcorrencia.trim()) {
            setMensagemOcorrencia(
                "Informe o título da ocorrência."
            );
            return;
        }

        if (!descricaoOcorrencia.trim()) {
            setMensagemOcorrencia(
                "Informe a descrição da ocorrência."
            );
            return;
        }

        try {
            setSalvandoOcorrencia(true);

            const cargaId = obterCargaId();

            const novaOcorrencia =
                await criarOcorrenciaCarga(cargaId, {
                    titulo: tituloOcorrencia.trim(),
                    descricao: descricaoOcorrencia.trim(),
                });

            setOcorrencias((ocorrenciasAtuais) => [
                novaOcorrencia,
                ...ocorrenciasAtuais,
            ]);
            setErroOcorrencias("");

            setTituloOcorrencia("");
            setDescricaoOcorrencia("");

            setMensagemOcorrencia(
                "Ocorrência registrada com sucesso!"
            );
        } catch (error) {
            if (error instanceof Error) {
                setMensagemOcorrencia(error.message);
            } else {
                setMensagemOcorrencia(
                    "Não foi possível registrar a ocorrência."
                );
            }
        } finally {
            setSalvandoOcorrencia(false);
        }
    }

    const etapas = [
        "Em preparação",
        "Em coleta",
        "Carregando",
        "Em trânsito",
        "Saiu para entrega",
        "Entregue",
    ];

    const indiceAtual = carga
        ? etapas.findIndex(
            (etapa) =>
                etapa.toLowerCase() ===
                carga.status.toLowerCase()
        )
        : -1;

    return (
        <AdminLayout>
            <div className="admin-page portal-page portal-cliente-page portal-cliente-detalhe-page">
                <AdminHeader
                    title={
                        carga
                            ? `Carga ${carga.codigo}`
                            : "Detalhes da Carga"
                    }
                    subtitle="Acompanhe as informações da sua carga."
                >
                    <Link to="/portal/cliente/minhas-cargas" className="cliente-detalhe-voltar">
                        Voltar para Minhas Cargas
                    </Link>
                </AdminHeader>

                {carregando && <p role="status">Carregando carga...</p>}

                {!carregando && erro && (
                    <p role="alert" className="mensagem-erro">{erro}</p>
                )}

                {!carregando && !erro && carga && (
                    <div className="admin-card detalhe-carga-cliente">
                        <section className="cliente-detalhe-painel" aria-labelledby="cliente-detalhe-painel-titulo">
                            <div className="cliente-detalhe-painel-topo">
                                <div>
                                    <p>Acompanhamento da carga</p>
                                    <h2 id="cliente-detalhe-painel-titulo">{carga.codigo}</h2>
                                </div>
                                <strong className="cliente-detalhe-status">{carga.status}</strong>
                            </div>
                            <div className="cliente-detalhe-rota">
                                <div><span>Origem</span><strong>{carga.origem?.trim() || "Origem não informada"}</strong></div>
                                <span className="cliente-detalhe-seta" aria-hidden="true">→</span>
                                <div><span>Destino</span><strong>{carga.destino?.trim() || "Destino não informado"}</strong></div>
                            </div>
                            <div className="cliente-detalhe-indicadores">
                                <div><span>Previsão de entrega</span><strong>{carga.previsao_entrega?.trim() || "Não informada"}</strong></div>
                                <div><span>Localização informada</span><strong>{carga.local_atual?.trim() || "Não informada"}</strong></div>
                                <div><span>Última atualização</span><strong>{carga.ultima_atualizacao?.trim() || "Não informada"}</strong></div>
                            </div>
                        </section>

                        {indiceAtual >= 0 && <section className="cliente-detalhe-progresso" aria-label="Progresso da entrega">
                            <h2>Progresso da entrega</h2>
                            <div className="cliente-progresso-carga">
                                {etapas.map((etapa, index) => {
                                    const concluida = index <= indiceAtual;
                                    const atual = index === indiceAtual;
                                    return <div key={etapa} className={`cliente-progresso-etapa ${concluida ? "concluida" : ""} ${atual ? "atual" : ""}`}>
                                        <div className="cliente-progresso-ponto">{concluida ? "✓" : index + 1}</div>
                                        <span>{etapa}</span>
                                    </div>;
                                })}
                            </div>
                        </section>}

                        <section className="detalhe-carga-secao cliente-detalhe-informacoes">
                            <h2>Informações da carga</h2>
                            <div className="carga-informacoes-grid">
                                <div className="carga-informacao-card"><Package size={22} /><div><span>Descrição da carga</span><strong>{carga.descricao_carga?.trim() || "Não informada"}</strong></div></div>
                                <div className="carga-informacao-card"><Package size={22} /><div><span>Peso</span><strong>{carga.peso_kg != null ? `${new Intl.NumberFormat("pt-BR").format(carga.peso_kg)} kg` : "Não informado"}</strong></div></div>
                                <div className="carga-informacao-card"><Clock3 size={22} /><div><span>Saída prevista</span><strong>{carga.data_prevista_saida?.trim() || "Não informada"}</strong></div></div>
                            </div>
                        </section>

                        <section className="detalhe-carga-secao">
                            <h2>Histórico de movimentações</h2>

                            <TimelineRastreamento
                                historico={carga.historico}
                            />
                        </section>

                        <section className="detalhe-carga-secao">
                            <div className="comprovantes-titulo">
                                <div>
                                    <h2>Comprovantes de entrega</h2>

                                    <p>
                                        Consulte as informações registradas na entrega
                                        da carga.
                                    </p>
                                </div>

                                <FileCheck2 size={26} />
                            </div>

                            {erroComprovantes && <p role="alert" className="mensagem-erro">{erroComprovantes}</p>}
                            {!erroComprovantes && <div className="comprovantes-lista">
                                {comprovantes.length === 0 && arquivosComprovante.length === 0 ? (
                                    <p className="comprovantes-vazio">
                                        Nenhum comprovante disponível até o momento.
                                    </p>
                                ) : (
                                    comprovantes.map((comprovante) => (
                                        <article
                                            className="comprovante-card"
                                            key={comprovante.id}
                                        >
                                            <div className="comprovante-card-icone">
                                                <FileCheck2 size={25} />
                                            </div>

                                            <div className="comprovante-card-conteudo">
                                                <div className="comprovante-card-topo">
                                                    <div>
                                                        <span className="comprovante-label">
                                                            Recebedor
                                                        </span>

                                                        <strong>
                                                            {comprovante.recebedor}
                                                        </strong>
                                                    </div>

                                                    <span className="comprovante-data">
                                                        {comprovante.data_entrega}
                                                    </span>
                                                </div>

                                                {comprovante.observacao ? (
                                                    <div className="comprovante-observacao">
                                                        <span>Observação</span>

                                                        <p>
                                                            {comprovante.observacao}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="comprovante-sem-observacao">
                                                        Nenhuma observação registrada.
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>}

                            {!erroComprovantes && arquivosComprovante.length > 0 && (
                                <div className="lista-arquivos">
                                    <h3>Arquivos do comprovante</h3>

                                    {erroDownload && (
                                        <p role="alert" className="mensagem-erro">{erroDownload}</p>
                                    )}

                                    {arquivosComprovante.map((arquivo) => (
                                        <div
                                            className="arquivo-item"
                                            key={arquivo.id}
                                        >
                                            <div>
                                                <strong>
                                                    {arquivo.nome_arquivo}
                                                </strong>

                                                <small>
                                                    {arquivo.data_upload}
                                                </small>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => abrirArquivo(
                                                    arquivo.download_endpoint
                                                )}
                                                className="btn-detalhes"
                                            >
                                                Abrir {arquivo.nome_arquivo}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                        <section className="detalhe-carga-secao">
                            <div className="ocorrencias-titulo">
                                <div>
                                    <h2>Ocorrências</h2>

                                    <p>Comunique problemas ou dúvidas relacionados a esta carga.</p>
                                </div>

                                <TriangleAlert size={25} />
                            </div>

                            <form
                                className="ocorrencia-form"
                                onSubmit={handleCriarOcorrencia}
                            >
                                <div className="linha-input">
                                    <label htmlFor="cliente-titulo-ocorrencia">
                                        Tipo ou título da ocorrência
                                    </label>

                                    <select
                                        id="cliente-titulo-ocorrencia"
                                        value={tituloOcorrencia}
                                        onChange={(event) =>
                                            setTituloOcorrencia(
                                                event.target.value
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Selecione
                                        </option>

                                        <option value="Atraso na entrega">
                                            Atraso na entrega
                                        </option>

                                        <option value="Mercadoria avariada">
                                            Mercadoria avariada
                                        </option>

                                        <option value="Endereço incorreto">
                                            Endereço incorreto
                                        </option>

                                        <option value="Dúvida sobre a carga">
                                            Dúvida sobre a carga
                                        </option>

                                        <option value="Outra ocorrência">
                                            Outra ocorrência
                                        </option>
                                    </select>
                                </div>

                                <div className="linha-input">
                                    <label htmlFor="cliente-descricao-ocorrencia">Descrição</label>

                                    <textarea
                                        id="cliente-descricao-ocorrencia"
                                        value={descricaoOcorrencia}
                                        onChange={(event) =>
                                            setDescricaoOcorrencia(
                                                event.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Descreva o que aconteceu..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={salvandoOcorrencia}
                                >
                                    {salvandoOcorrencia
                                        ? "Registrando..."
                                        : "Registrar Ocorrência"}
                                </button>

                                {mensagemOcorrencia && (
                                    <p className="mensagem-ocorrencia">
                                        {mensagemOcorrencia}
                                    </p>
                                )}
                            </form>

                            <div className="ocorrencias-lista">
                                {erroOcorrencias ? <p role="alert" className="mensagem-erro">{erroOcorrencias}</p> : ocorrencias.length === 0 ? (
                                    <p className="ocorrencias-vazia">
                                        Nenhuma ocorrência registrada
                                        para esta carga.
                                    </p>
                                ) : (
                                    ocorrencias.map((ocorrencia) => (
                                        <article
                                            className="ocorrencia-card"
                                            key={ocorrencia.id}
                                        >
                                            <div className="ocorrencia-card-topo">
                                                <strong>
                                                    {ocorrencia.titulo}
                                                </strong>

                                                <span>
                                                    {
                                                        ocorrencia.data_ocorrencia
                                                    }
                                                </span>
                                            </div>

                                            <p>
                                                {ocorrencia.descricao}
                                            </p>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default DetalheCargaCliente;

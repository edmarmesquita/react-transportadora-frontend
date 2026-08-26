import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    MapPin,
    Navigation,
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

    const [tituloOcorrencia, setTituloOcorrencia] =
        useState("");

    const [descricaoOcorrencia, setDescricaoOcorrencia] =
        useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvandoOcorrencia, setSalvandoOcorrencia] =
        useState(false);

    const [erro, setErro] = useState("");
    const [mensagemOcorrencia, setMensagemOcorrencia] =
        useState("");

    useEffect(() => {
        carregarPagina();
    }, [id]);

    function obterCargaId(): number {
        const cargaId = Number(id);

        if (!cargaId) {
            throw new Error("Identificador da carga inválido.");
        }

        return cargaId;
    }

    async function carregarPagina() {
        try {
            setCarregando(true);
            setErro("");

            const cargaId = obterCargaId();

            const [
                dadosCarga,
                dadosOcorrencias,
                dadosComprovantes,
            ] = await Promise.all([
                buscarDetalheCarga(cargaId),
                listarOcorrenciasCarga(cargaId),
                listarComprovantesCarga(cargaId),
            ]);

            setCarga(dadosCarga);
            setOcorrencias(dadosOcorrencias);
            setComprovantes(dadosComprovantes.comprovantes);
            setArquivosComprovante(dadosComprovantes.arquivos);
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível carregar a carga.");
            }
        } finally {
            setCarregando(false);
        }
    }

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
            <div className="admin-page">
                <AdminHeader
                    title={
                        carga
                            ? `Carga ${carga.codigo}`
                            : "Detalhes da Carga"
                    }
                    subtitle="Acompanhe as informações da sua carga."
                >
                    <Link to="/portal/cliente">
                        Voltar
                    </Link>
                </AdminHeader>

                {carga && (
                    <div className="cliente-progresso-carga">
                        {etapas.map((etapa, index) => {
                            const concluida =
                                indiceAtual >= 0 &&
                                index <= indiceAtual;

                            const atual =
                                index === indiceAtual;

                            return (
                                <div
                                    key={etapa}
                                    className={`cliente-progresso-etapa ${concluida ? "concluida" : ""
                                        } ${atual ? "atual" : ""
                                        }`}
                                >
                                    <div className="cliente-progresso-ponto">
                                        {concluida ? "✓" : index + 1}
                                    </div>

                                    <span>{etapa}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {carregando && <p>Carregando carga...</p>}

                {!carregando && erro && (
                    <p className="mensagem-erro">{erro}</p>
                )}

                {!carregando && !erro && carga && (
                    <div className="admin-card detalhe-carga-cliente">
                        <div className="carga-resumo">
                            <div className="carga-resumo-topo">
                                <div>
                                    <span className="carga-codigo-label">
                                        Código da carga
                                    </span>

                                    <h2 className="carga-codigo">
                                        <Package size={24} />
                                        {carga.codigo}
                                    </h2>
                                </div>

                                <span
                                    className={`carga-status carga-status-${carga.status
                                        .toLowerCase()
                                        .replaceAll(" ", "-")
                                        .replaceAll("í", "i")
                                        .replaceAll("ã", "a")}`}
                                >
                                    {carga.status}
                                </span>
                            </div>

                            <div className="carga-informacoes-grid">
                                <div className="carga-informacao-card">
                                    <MapPin size={22} />

                                    <div>
                                        <span>Local atual</span>
                                        <strong>
                                            {carga.local_atual || "-"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="carga-informacao-card">
                                    <Navigation size={22} />

                                    <div>
                                        <span>Destino</span>
                                        <strong>
                                            {carga.destino || "-"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="carga-informacao-card">
                                    <Clock3 size={22} />

                                    <div>
                                        <span>
                                            Última atualização
                                        </span>

                                        <strong>
                                            {carga.ultima_atualizacao ||
                                                "-"}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="detalhe-carga-secao">
                            <h2>Timeline logística</h2>

                            <TimelineRastreamento
                                historico={carga.historico}
                            />
                        </section>

                        <section className="detalhe-carga-secao">
                            <div className="comprovantes-titulo">
                                <div>
                                    <h2>Documentos e comprovantes</h2>

                                    <p>
                                        Consulte as informações registradas na entrega
                                        da carga.
                                    </p>
                                </div>

                                <FileCheck2 size={26} />
                            </div>

                            <div className="comprovantes-lista">
                                {comprovantes.length === 0 ? (
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
                            </div>

                            {arquivosComprovante.length > 0 && (
                                <div className="lista-arquivos">
                                    <h3>Arquivos do comprovante</h3>

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
                        </section>
                        <section className="detalhe-carga-secao">
                            <div className="ocorrencias-titulo">
                                <div>
                                    <h2>Ocorrências</h2>

                                    <p>
                                        Registre problemas ou dúvidas
                                        relacionados a esta carga.
                                    </p>
                                </div>

                                <TriangleAlert size={25} />
                            </div>

                            <form
                                className="ocorrencia-form"
                                onSubmit={handleCriarOcorrencia}
                            >
                                <div className="linha-input">
                                    <label>
                                        Tipo ou título da ocorrência
                                    </label>

                                    <select
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
                                    <label>Descrição</label>

                                    <textarea
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
                                {ocorrencias.length === 0 ? (
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

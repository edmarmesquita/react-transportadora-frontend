import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import { listarMinhasCargas } from "../services/clienteService";
import type { MinhaCarga } from "../types/minhaCarga";

const preOperacao = new Set(["pendente", "programada", "planejada"]);
const emAndamento = new Set(["em preparação", "em coleta", "carregando", "em trânsito", "saiu para entrega", "em andamento", "parada operacional"]);
const historico = new Set(["entregue", "finalizada"]);
const excepcional = new Set(["cancelada"]);

function categoria(carga: MinhaCarga) {
    const status = carga.status.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
    if (emAndamento.has(status)) return "andamento";
    if (preOperacao.has(status)) return "preparacao";
    if (historico.has(status)) return "historico";
    if (excepcional.has(status)) return "excepcional";
    return "desconhecido";
}

function texto(valor: string | null | undefined, fallback = "Não informada") {
    return valor?.trim() || fallback;
}

function RotaCarga({ carga }: { carga: MinhaCarga }) {
    return <div className="cliente-home-rota">
        <div><span>Origem</span><strong>{texto(carga.origem, "Origem não informada")}</strong></div>
        <span className="cliente-home-seta" aria-hidden="true">→</span>
        <div><span>Destino</span><strong>{texto(carga.destino, "Destino não informado")}</strong></div>
    </div>;
}

function PortalClienteHome() {
    const [cargas, setCargas] = useState<MinhaCarga[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarMinhasCargas()
            .then((dados) => { if (ativo) setCargas(dados); })
            .catch((error: unknown) => {
                if (ativo) setErro(error instanceof Error ? error.message : "Não foi possível carregar suas informações.");
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const ativas = cargas.filter((carga) => categoria(carga) === "andamento");
    const preparacao = cargas.filter((carga) => categoria(carga) === "preparacao");
    const concluidas = cargas.filter((carga) => categoria(carga) === "historico");
    const principal = ativas[0] ?? preparacao[0];
    const principalAtiva = ativas.length > 0;

    return <AdminLayout>
        <div className="admin-page portal-page portal-cliente-page cliente-home-page">
            <AdminHeader title="Portal do Cliente" subtitle="Acompanhe suas cargas e entregas." />
            {carregando && <p role="status">Carregando informações...</p>}
            {!carregando && erro && <p role="alert" className="mensagem-erro">{erro}</p>}
            {!carregando && !erro && <div className="cliente-home-conteudo">
                <section className="cliente-home-destaque" aria-labelledby="cliente-home-titulo">
                    {principal ? <>
                        <div className="cliente-home-cabecalho">
                            <div>
                                <p className="cliente-home-sobretitulo">Acompanhamento da carga</p>
                                <h2 id="cliente-home-titulo">{principalAtiva ? "Sua carga está a caminho" : "Próxima carga"}</h2>
                            </div>
                            <span className="cliente-home-status">{texto(principal.status, "Status não informado")}</span>
                        </div>
                        <RotaCarga carga={principal} />
                        <div className="cliente-home-informacoes">
                            {!principalAtiva && principal.data_prevista_saida?.trim() && <div><span>Saída prevista</span><strong>{principal.data_prevista_saida}</strong></div>}
                            {principal.previsao_entrega?.trim() && <div><span>Previsão de entrega</span><strong>{principal.previsao_entrega}</strong></div>}
                            {principalAtiva && <div><span>Localização informada</span><strong>{texto(principal.local_atual)}</strong></div>}
                            {principal.ultima_atualizacao?.trim() && <div><span>Última atualização</span><strong>{principal.ultima_atualizacao}</strong></div>}
                            <div><span>Código de rastreamento</span><strong>{principal.codigo}</strong></div>
                        </div>
                        <Link className="cliente-home-acao" to={`/portal/cliente/minhas-cargas/${principal.id}`}>Acompanhar carga</Link>
                    </> : cargas.length === 0 ? <>
                        <h2 id="cliente-home-titulo">Nenhuma carga disponível</h2>
                        <p>Você ainda não possui cargas disponíveis para acompanhamento.</p>
                    </> : <>
                        <h2 id="cliente-home-titulo">Nenhuma carga em andamento</h2>
                        <p>Você não possui cargas em andamento no momento.</p>
                        <Link className="cliente-home-acao" to="/portal/cliente/minhas-cargas">Ver histórico de cargas</Link>
                    </>}
                </section>

                {principalAtiva && ativas.length > 1 && <section className="cliente-home-outras" aria-labelledby="cliente-home-outras-titulo">
                    <h2 id="cliente-home-outras-titulo">Outras cargas em andamento</h2>
                    <div className="cliente-home-outras-grid">
                        {ativas.slice(1, 4).map((carga) => <article className="cliente-home-card" key={carga.id}>
                            <div className="cliente-home-card-topo"><h3>{carga.codigo}</h3><span className="cliente-home-status">{carga.status}</span></div>
                            <RotaCarga carga={carga} />
                            <p><span>Previsão de entrega</span><strong>{texto(carga.previsao_entrega)}</strong></p>
                            <Link to={`/portal/cliente/minhas-cargas/${carga.id}`}>Acompanhar carga</Link>
                        </article>)}
                    </div>
                </section>}

                <section className="cliente-home-resumo" aria-label="Resumo das cargas">
                    <div><strong>{ativas.length}</strong><span>Em andamento</span></div>
                    <div><strong>{preparacao.length}</strong><span>Em preparação</span></div>
                    <div><strong>{concluidas.length}</strong><span>Concluídas</span></div>
                    <div><strong>{cargas.length}</strong><span>Total de cargas</span></div>
                </section>
                {cargas.length > 0 && principal && <Link className="cliente-home-todas" to="/portal/cliente/minhas-cargas">Ver todas as cargas →</Link>}
            </div>}
        </div>
    </AdminLayout>;
}

export default PortalClienteHome;

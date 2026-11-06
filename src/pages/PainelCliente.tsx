import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import { listarMinhasCargas } from "../services/clienteService";
import type { MinhaCarga } from "../types/minhaCarga";

type Categoria = "andamento" | "preparacao" | "historico" | "canceladas" | "outros";

const statusPorCategoria: Record<Exclude<Categoria, "outros">, Set<string>> = {
    preparacao: new Set(["pendente", "programada", "planejada"]),
    andamento: new Set(["em preparação", "em coleta", "carregando", "em trânsito", "saiu para entrega", "em andamento", "parada operacional"]),
    historico: new Set(["entregue", "finalizada"]),
    canceladas: new Set(["cancelada"]),
};

const secoes: { categoria: Categoria; titulo: string }[] = [
    { categoria: "andamento", titulo: "Em andamento" },
    { categoria: "preparacao", titulo: "Em preparação" },
    { categoria: "historico", titulo: "Histórico" },
    { categoria: "canceladas", titulo: "Canceladas" },
    { categoria: "outros", titulo: "Outros status" },
];

const porVez = 6;

function classificar(status: string): Categoria {
    const normalizado = status.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
    for (const categoria of ["andamento", "preparacao", "historico", "canceladas"] as const) {
        if (statusPorCategoria[categoria].has(normalizado)) return categoria;
    }
    return "outros";
}

function texto(valor: string | null | undefined, fallback: string) {
    return valor?.trim() || fallback;
}

function CardCarga({ carga, categoria }: { carga: MinhaCarga; categoria: Categoria }) {
    const acompanhamento = categoria === "andamento" || categoria === "preparacao";
    return <article className={`cliente-lista-card cliente-lista-card-${categoria}`}>
        <div className="cliente-lista-card-topo">
            <div><span>Código de rastreamento</span><h3>{carga.codigo}</h3></div>
            <span className="cliente-lista-status">{texto(carga.status, "Status não informado")}</span>
        </div>
        <div className="cliente-lista-rota">
            <div><span>Origem</span><strong>{texto(carga.origem, "Origem não informada")}</strong></div>
            <span className="cliente-lista-seta" aria-hidden="true">→</span>
            <div><span>Destino</span><strong>{texto(carga.destino, "Destino não informado")}</strong></div>
        </div>
        <div className="cliente-lista-dados">
            {categoria === "preparacao" && carga.data_prevista_saida?.trim() && <div><span>Saída prevista</span><strong>{carga.data_prevista_saida}</strong></div>}
            {(categoria === "andamento" || categoria === "preparacao") && carga.previsao_entrega?.trim() && <div><span>Previsão de entrega</span><strong>{carga.previsao_entrega}</strong></div>}
            {categoria === "andamento" && carga.local_atual?.trim() && <div><span>Localização informada</span><strong>{carga.local_atual}</strong></div>}
            {carga.ultima_atualizacao?.trim() && <div><span>Última atualização</span><strong>{carga.ultima_atualizacao}</strong></div>}
        </div>
        <Link className="cliente-lista-acao" to={`/portal/cliente/minhas-cargas/${carga.id}`} aria-label={`${acompanhamento ? "Acompanhar carga" : "Ver detalhes"} ${carga.codigo}`}>
            {acompanhamento ? "Acompanhar carga" : "Ver detalhes"}
        </Link>
    </article>;
}

function PainelCliente() {
    const [cargas, setCargas] = useState<MinhaCarga[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [pesquisa, setPesquisa] = useState("");
    const [limites, setLimites] = useState<Partial<Record<Categoria, number>>>({});

    useEffect(() => {
        let ativo = true;
        listarMinhasCargas()
            .then((dados) => { if (ativo) setCargas(dados); })
            .catch((error: unknown) => {
                if (ativo) setErro(error instanceof Error ? error.message : "Não foi possível carregar suas cargas.");
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");
    const filtradas = termo ? cargas.filter((carga) => [
        carga.codigo, carga.status, carga.origem, carga.destino,
        carga.local_atual, carga.descricao_carga,
    ].some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(termo))) : cargas;

    return <AdminLayout>
        <div className="admin-page portal-page portal-cliente-page portal-cliente-cargas-page cliente-lista-page">
            <AdminHeader title="Minhas Cargas" subtitle="Acompanhe suas cargas em andamento e consulte seu histórico." />
            {carregando && <p role="status">Carregando suas cargas...</p>}
            {!carregando && erro && <p role="alert" className="mensagem-erro">{erro}</p>}
            {!carregando && !erro && cargas.length === 0 && <div className="cliente-lista-vazio"><h2>Nenhuma carga disponível</h2><p>Você ainda não possui cargas disponíveis.</p></div>}
            {!carregando && !erro && cargas.length > 0 && <>
                <div className="cliente-lista-pesquisa">
                    <label htmlFor="cliente-pesquisar-cargas">Pesquisar cargas</label>
                    <input id="cliente-pesquisar-cargas" type="search" value={pesquisa} placeholder="Código, status, rota ou descrição" onChange={(event) => {
                        setPesquisa(event.target.value);
                        setLimites({});
                    }} />
                </div>
                {filtradas.length === 0 ? <p role="status" className="cliente-lista-vazio">Nenhuma carga encontrada para esta pesquisa.</p> :
                    secoes.map(({ categoria, titulo }) => {
                        const itens = filtradas.filter((carga) => classificar(carga.status) === categoria);
                        if (itens.length === 0) return null;
                        const limite = limites[categoria] ?? porVez;
                        return <section className="cliente-lista-secao" aria-label={`${titulo} (${itens.length})`} key={categoria}>
                            <h2>{titulo} <span>({itens.length})</span></h2>
                            <div className="cliente-lista-grid">
                                {itens.slice(0, limite).map((carga) => <CardCarga key={carga.id} carga={carga} categoria={categoria} />)}
                            </div>
                            {limite < itens.length && <button className="cliente-lista-mais" type="button" onClick={() => setLimites((atual) => ({ ...atual, [categoria]: limite + porVez }))}>
                                Mostrar mais em {titulo.toLocaleLowerCase("pt-BR")}
                            </button>}
                        </section>;
                    })}
            </>}
        </div>
    </AdminLayout>;
}

export default PainelCliente;

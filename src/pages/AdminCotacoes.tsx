import { Link } from "react-router-dom";
import { useEffect, useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api";

type Cotacao = {
    id: number
    cliente: string
    whatsapp: string
    origem: string
    destino: string
    tipo_carga: string
    observacoes: string
    data_criacao: string
}

type ClienteOpcao = {
    id: number
    razao_social: string
    nome_fantasia: string | null
    ativo: boolean
}

function AdminCotacoes() {
    const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
    const [clientes, setClientes] = useState<ClienteOpcao[]>([])
    const [clientesSelecionados, setClientesSelecionados] = useState<
        Record<number, string>
    >({})

    async function carregarCotacoes() {
        try {
            const resposta = await apiFetch(
                "/api/admin/cotacoes"
            )

            const dados =
                await resposta.json().catch(() => null)

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível carregar as cotações."
                )
            }

            setCotacoes(
                Array.isArray(dados) ? dados : []
            )
        } catch (erro) {
            console.error(
                "Erro ao carregar cotações:",
                erro
            )

            setCotacoes([])
        }
    }

    async function carregarClientes() {
        try {
            const resposta = await apiFetch("/api/admin/clientes")
            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    "Não foi possível carregar os clientes."
                )
            }

            setClientes(
                Array.isArray(dados)
                    ? dados.filter(
                        (cliente: ClienteOpcao) => cliente.ativo
                    )
                    : []
            )
        } catch (erro) {
            console.error("Erro ao carregar clientes:", erro)
            setClientes([])
        }
    }

    async function aprovarCotacao(id: number) {
        const clienteId = Number(clientesSelecionados[id])

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            alert("Selecione o cliente comercial.")
            return
        }

        const confirmar = window.confirm(
            "Deseja aprovar esta cotação e criar a carga?"
        );

        if (!confirmar) {
            return;
        }

        try {
            const resposta = await apiFetch(
                `/api/admin/cotacoes/${id}/aprovar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cliente_id: clienteId,
                    }),
                }
            );

            const dados = await resposta.json().catch(() => null);

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.mensagem ||
                    "Não foi possível aprovar a cotação."
                );
            }

            alert(
                dados?.mensagem ||
                "Cotação aprovada e carga criada com sucesso!"
            );

            setCotacoes((cotacoesAtuais) =>
                cotacoesAtuais.filter(
                    (cotacao) => cotacao.id !== id
                )
            );
        } catch (erro) {
            console.error("Erro ao aprovar cotação:", erro);

            if (erro instanceof Error) {
                alert(erro.message);
            } else {
                alert("Não foi possível aprovar a cotação.");
            }
        }
    }

    useEffect(() => {
        carregarCotacoes()
        carregarClientes()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Cotações"
                    subtitle="Gerencie as cotações recebidas."
                >
                    <Link
                        to="/admin/cotacoes/nova"
                        className="btn-primary"
                    >
                        Nova Cotação
                    </Link>
                </AdminHeader>

                <div className="tabela-cargas">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>WhatsApp</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Carga</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cotacoes.map((cotacao) => (
                                <tr key={cotacao.id}>
                                    <td>{cotacao.cliente}</td>
                                    <td>{cotacao.whatsapp}</td>
                                    <td>{cotacao.origem}</td>
                                    <td>{cotacao.destino}</td>
                                    <td>{cotacao.tipo_carga}</td>
                                    <td>{cotacao.data_criacao}</td>

                                    <td>
                                        <div className="cotacao-acoes">
                                            <select
                                                aria-label={`Cliente comercial da cotação ${cotacao.id}`}
                                                value={clientesSelecionados[cotacao.id] ?? ""}
                                                onChange={(event) =>
                                                    setClientesSelecionados((atuais) => ({
                                                        ...atuais,
                                                        [cotacao.id]: event.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="">
                                                    Selecione o cliente
                                                </option>
                                                {clientes.map((cliente) => (
                                                    <option
                                                        key={cliente.id}
                                                        value={cliente.id}
                                                    >
                                                        {cliente.nome_fantasia || cliente.razao_social}
                                                    </option>
                                                ))}
                                            </select>

                                            <a
                                                className="btn-whatsapp"
                                                href={`https://wa.me/55${cotacao.whatsapp}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Chamar
                                            </a>

                                            <button
                                                type="button"
                                                className="btn-aprovar-cotacao"
                                                onClick={() =>
                                                    aprovarCotacao(cotacao.id)
                                                }
                                            >
                                                Aprovar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminCotacoes

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"
import { useNotification } from "../components/ui/NotificationProvider"

type ClienteOpcao = {
    id: number
    razao_social: string
    nome_fantasia: string | null
    ativo: boolean
}

function NovaCarga() {
    const navigate = useNavigate()
    const { notificar } = useNotification()

    const [formData, setFormData] = useState({
        cliente_id: "",
        status: "Pendente",
        local_atual: "",
        destino: "",
        valor_frete: "",
        status_pagamento: "Pendente",
    })

    const [loading, setLoading] = useState(false)
    const [clientes, setClientes] = useState<ClienteOpcao[]>([])
    const [carregandoClientes, setCarregandoClientes] = useState(true)

    useEffect(() => {
        async function carregarClientes() {
            try {
                const resposta = await apiFetch("/api/admin/clientes")
                const dados = await resposta.json()

                if (!resposta.ok) {
                    throw new Error(
                        dados.erro || "Erro ao carregar clientes."
                    )
                }

                setClientes(
                    (dados as ClienteOpcao[]).filter(
                        (cliente) => cliente.ativo
                    )
                )
            } catch (error) {
                notificar("erro",
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar clientes."
                )
            } finally {
                setCarregandoClientes(false)
            }
        }

        carregarClientes()
    }, [notificar])

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) {
        const { name, value } = event.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setLoading(true)

        try {
            const resposta = await apiFetch(
                "/api/admin/cargas",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                notificar(
                    resposta.status === 403 || resposta.status === 409 ? "aviso" : "erro",
                    dados?.erro || dados?.msg || "Erro ao criar carga."
                )
                return
            }

            notificar("sucesso", "Carga cadastrada com sucesso!")
            navigate("/admin/cargas")
        } catch {
            notificar("erro", "Erro ao conectar com o servidor.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Nova Carga</h1>
                        <p>Cadastro operacional de nova carga</p>
                    </div>
                </div>

                <form className="admin-form admin-form-card admin-form-grid" onSubmit={handleSubmit}>
                    <div className="linha-input">
                        <label>Cliente</label>

                        <select
                            name="cliente_id"
                            value={formData.cliente_id}
                            onChange={handleChange}
                            disabled={carregandoClientes}
                            required
                        >
                            <option value="">
                                {carregandoClientes
                                    ? "Carregando clientes..."
                                    : "Selecione um cliente"}
                            </option>

                            {clientes.map((cliente) => (
                                <option
                                    key={cliente.id}
                                    value={cliente.id}
                                >
                                    {cliente.razao_social}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="linha-input">
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option>Pendente</option>
                            <option>Programada</option>
                        </select>
                    </div>

                    <div className="linha-input">
                        <label>Local atual</label>
                        <input
                            name="local_atual"
                            value={formData.local_atual}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Destino</label>
                        <input
                            name="destino"
                            value={formData.destino}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label>Valor do frete</label>

                        <input
                            name="valor_frete"
                            value={formData.valor_frete}
                            onChange={handleChange}
                            placeholder="Ex: 3500"
                        />
                    </div>

                    <div className="linha-input">
                        <label>Status do pagamento</label>

                        <select
                            name="status_pagamento"
                            value={formData.status_pagamento}
                            onChange={handleChange}
                        >
                            <option>Pendente</option>
                            <option>Pago</option>
                        </select>
                    </div>

                    <button className="btn-nova-carga" type="submit">
                        {loading ? "Salvando..." : "Salvar Carga"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovaCarga

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { useNotification } from "../components/ui/NotificationProvider"
import { apiFetch } from "../services/api"

type FormCarga = {
    codigo: string
    cliente_id: string
    local_atual: string
    destino: string
    valor_frete: string
    status_pagamento: string
}

type ClienteOpcao = {
    id: number
    razao_social: string
    nome_fantasia: string | null
    ativo: boolean
}

function EditarCarga() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { notificar } = useNotification()

    const [formData, setFormData] = useState<FormCarga>({
        codigo: "",
        cliente_id: "",
        local_atual: "",
        destino: "",
        valor_frete: "",
        status_pagamento: "Pendente",
    })

    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [clientes, setClientes] = useState<ClienteOpcao[]>([])

    async function carregarClientes() {
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
    }

    async function carregarCarga() {
        const resposta = await apiFetch(
            `/api/admin/cargas/${id}`
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                dados.msg ||
                "Erro ao carregar carga."
            )
        }

        setFormData({
            codigo: dados.codigo || "",
            cliente_id: dados.cliente_id
                ? String(dados.cliente_id)
                : "",
            local_atual: dados.local_atual || "",
            destino: dados.destino || "",
            valor_frete: dados.valor_frete !== null &&
                dados.valor_frete !== undefined
                ? String(dados.valor_frete)
                : "",
            status_pagamento:
                dados.status_pagamento || "Pendente",
        })
    }

    async function carregarPagina() {
        try {
            setLoading(true)
            await Promise.all([
                carregarClientes(),
                carregarCarga(),
            ])
        } catch (error) {
            if (error instanceof Error) {
                notificar("erro", error.message)
            } else {
                notificar(
                    "erro",
                    "Não foi possível carregar os dados."
                )
            }
        } finally {
            setLoading(false)
        }
    }

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

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        try {
            setSalvando(true)

            const resposta = await apiFetch(
                `/api/admin/cargas/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                    dados.msg ||
                    "Erro ao atualizar carga."
                )
            }

            notificar(
                "sucesso",
                dados.mensagem ||
                "Carga atualizada com sucesso!"
            )

            navigate("/admin/cargas")
        } catch (error) {
            if (error instanceof Error) {
                notificar("erro", error.message)
            } else {
                notificar(
                    "erro",
                    "Erro ao conectar com o servidor."
                )
            }
        } finally {
            setSalvando(false)
        }
    }

    useEffect(() => {
        carregarPagina()
    }, [id])

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-page">
                    <h2>Carregando carga...</h2>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Editar Carga</h1>

                        <p>
                            Atualize os dados cadastrais e
                            comerciais da carga.
                        </p>
                    </div>
                </div>

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={handleSubmit}
                >
                    <div className="linha-input">
                        <label htmlFor="codigo">
                            Código
                        </label>

                        <input
                            id="codigo"
                            name="codigo"
                            value={formData.codigo}
                            readOnly
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="cliente">
                            Cliente
                        </label>

                        <select
                            id="cliente"
                            name="cliente_id"
                            value={formData.cliente_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Selecione um cliente
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
                        <label htmlFor="local_atual">
                            Local atual
                        </label>

                        <input
                            id="local_atual"
                            name="local_atual"
                            value={formData.local_atual}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="destino">
                            Destino
                        </label>

                        <input
                            id="destino"
                            name="destino"
                            value={formData.destino}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="valor_frete">
                            Valor do frete
                        </label>

                        <input
                            id="valor_frete"
                            name="valor_frete"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.valor_frete}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="status_pagamento">
                            Status do pagamento
                        </label>

                        <select
                            id="status_pagamento"
                            name="status_pagamento"
                            value={formData.status_pagamento}
                            onChange={handleChange}
                        >
                            <option value="Pendente">
                                Pendente
                            </option>

                            <option value="Pago">
                                Pago
                            </option>
                        </select>
                    </div>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                        disabled={salvando}
                    >
                        {salvando
                            ? "Salvando..."
                            : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default EditarCarga

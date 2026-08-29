import { useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import AdminHeader from "../components/layout/AdminHeader"
import { apiFetch } from "../services/api"

type FormCotacao = {
    cliente: string
    whatsapp: string
    origem: string
    destino: string
    tipo_carga: string
    observacoes: string
}

function NovaCotacao() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState<FormCotacao>({
        cliente: "",
        whatsapp: "",
        origem: "",
        destino: "",
        tipo_carga: "",
        observacoes: "",
    })

    const [erro, setErro] = useState("")
    const [salvando, setSalvando] = useState(false)

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) {
        const { name, value } = event.target

        setFormData((dadosAnteriores) => ({
            ...dadosAnteriores,
            [name]: value,
        }))
    }

    function validarFormulario() {
        if (!formData.cliente.trim()) {
            setErro("Informe o nome do cliente.")
            return false
        }

        if (!formData.whatsapp.trim()) {
            setErro("Informe o WhatsApp do cliente.")
            return false
        }

        if (!formData.origem.trim()) {
            setErro("Informe a origem.")
            return false
        }

        if (!formData.destino.trim()) {
            setErro("Informe o destino.")
            return false
        }

        if (!formData.tipo_carga.trim()) {
            setErro("Informe o tipo da carga.")
            return false
        }

        return true
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setErro("")

        if (!validarFormulario()) {
            return
        }

        try {
            setSalvando(true)

            const resposta = await apiFetch(
                "/api/admin/cotacoes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cliente: formData.cliente.trim(),
                        whatsapp: formData.whatsapp.trim(),
                        origem: formData.origem.trim(),
                        destino: formData.destino.trim(),
                        tipo_carga: formData.tipo_carga.trim(),
                        observacoes: formData.observacoes.trim(),
                    }),
                }
            )

            const dados = await resposta.json().catch(() => null)

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    dados?.msg ||
                    "Não foi possível cadastrar a cotação."
                )
            }

            alert(
                dados?.mensagem ||
                "Cotação cadastrada com sucesso!"
            )

            navigate("/admin/cotacoes")
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message)
            } else {
                setErro(
                    "Não foi possível conectar com o servidor."
                )
            }
        } finally {
            setSalvando(false)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Nova Cotação"
                    subtitle="Cadastre uma nova solicitação de frete."
                />

                {erro && (
                    <p className="mensagem-erro">
                        {erro}
                    </p>
                )}

                <form
                    className="admin-form admin-form-card admin-form-grid"
                    onSubmit={handleSubmit}
                >
                    <div className="linha-input">
                        <label htmlFor="cliente">
                            Cliente
                        </label>

                        <input
                            id="cliente"
                            name="cliente"
                            type="text"
                            placeholder="Nome do cliente"
                            value={formData.cliente}
                            onChange={handleChange}
                            disabled={salvando}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="whatsapp">
                            WhatsApp
                        </label>

                        <input
                            id="whatsapp"
                            name="whatsapp"
                            type="text"
                            placeholder="Ex.: 11999999999"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            disabled={salvando}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="origem">
                            Origem
                        </label>

                        <input
                            id="origem"
                            name="origem"
                            type="text"
                            placeholder="Cidade ou endereço de origem"
                            value={formData.origem}
                            onChange={handleChange}
                            disabled={salvando}
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
                            type="text"
                            placeholder="Cidade ou endereço de destino"
                            value={formData.destino}
                            onChange={handleChange}
                            disabled={salvando}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="tipo_carga">
                            Tipo de carga
                        </label>

                        <input
                            id="tipo_carga"
                            name="tipo_carga"
                            type="text"
                            placeholder="Ex.: Móveis, alimentos, eletrônicos"
                            value={formData.tipo_carga}
                            onChange={handleChange}
                            disabled={salvando}
                            required
                        />
                    </div>

                    <div className="linha-input">
                        <label htmlFor="observacoes">
                            Observações
                        </label>

                        <textarea
                            id="observacoes"
                            name="observacoes"
                            placeholder="Informações adicionais sobre a cotação"
                            value={formData.observacoes}
                            onChange={handleChange}
                            rows={5}
                            disabled={salvando}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secundario"
                            onClick={() =>
                                navigate("/admin/cotacoes")
                            }
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={salvando}
                        >
                            {salvando
                                ? "Salvando..."
                                : "Cadastrar Cotação"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovaCotacao

import { useState } from "react"

import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Textarea from "../ui/Textarea"

type QuoteFormData = {
    cliente: string
    whatsapp: string
    origem: string
    destino: string
    tipoCarga: string
    observacoes: string
}

function QuoteForm() {
    const [formData, setFormData] = useState<QuoteFormData>({
        cliente: "",
        whatsapp: "",
        origem: "",
        destino: "",
        tipoCarga: "fracionada",
        observacoes: "",
    })

    const [erro, setErro] = useState("")
    const [loading, setLoading] = useState(false)
    const [sucesso, setSucesso] = useState("")

    function handleChange(
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) {
        const { name, value } = event.target

        if (name === "whatsapp") {
            const somenteNumeros = value.replace(/\D/g, "")

            setFormData((prev) => ({
                ...prev,
                whatsapp: somenteNumeros,
            }))

            return
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (
            !formData.cliente ||
            !formData.whatsapp ||
            !formData.origem ||
            !formData.destino
        ) {
            setErro("Preencha todos os campos obrigatórios.")
            return
        }

        setErro("")
        setLoading(true)

        setTimeout(async () => {
            try {
                const resposta = await fetch(
                    "http://localhost:5000/api/cotacoes",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify(formData),
                    }
                )

                const dados = await resposta.json()

                if (!resposta.ok) {
                    setErro(
                        dados.erro || "Erro ao enviar orçamento."
                    )

                    setLoading(false)

                    return
                }

                setSucesso(dados.mensagem)

                setFormData({
                    cliente: "",
                    whatsapp: "",
                    origem: "",
                    destino: "",
                    tipoCarga: "fracionada",
                    observacoes: "",
                })

                setLoading(false)

                setTimeout(() => {
                    setSucesso("")
                }, 4000)
            } catch (erro) {
                setErro("Erro ao conectar com o servidor.")

                setLoading(false)
            }
        }, 2000)
    }

    return (
        <form className="quote-form" onSubmit={handleSubmit}>
            <Input
                label="Nome/Empresa:"
                name="cliente"
                required
                value={formData.cliente}
                onChange={handleChange}
            />

            <Input
                label="WhatsApp:"
                name="whatsapp"
                placeholder="11999999999"
                required
                value={formData.whatsapp}
                onChange={handleChange}
            />

            <Input
                label="Origem:"
                name="origem"
                required
                value={formData.origem}
                onChange={handleChange}
            />

            <Input
                label="Destino:"
                name="destino"
                required
                value={formData.destino}
                onChange={handleChange}
            />

            <Select
                label="Tipo de Carga:"
                name="tipoCarga"
                value={formData.tipoCarga}
                onChange={handleChange}
            />

            <Textarea
                label="Observações:"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
            />

            {erro && <p className="mensagem-erro">{erro}</p>}
            {sucesso && (
                <p className="mensagem-sucesso">
                    {sucesso}
                </p>
            )}

            <Button
                texto={loading ? "Enviando..." : "Enviar Orçamento"}
                type="submit"
            />
        </form>
    )
}

export default QuoteForm
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"

function NovaViagem() {
    const navigate = useNavigate()

    const [cargas, setCargas] = useState<any[]>([])
    const [motoristas, setMotoristas] = useState<any[]>([])
    const [veiculos, setVeiculos] = useState<any[]>([])

    const [formData, setFormData] = useState({
        rastreamento_id: "",
        motorista_id: "",
        veiculo_id: "",
    })

    async function carregarDados() {
        const respostaCargas = await fetch(
            "http://127.0.0.1:5000/api/admin/cargas"
        )

        const dadosCargas = await respostaCargas.json()

        const respostaMotoristas = await fetch(
            "http://127.0.0.1:5000/api/admin/motoristas"
        )

        const dadosMotoristas = await respostaMotoristas.json()

        const respostaVeiculos = await fetch(
            "http://127.0.0.1:5000/api/admin/veiculos"
        )

        const dadosVeiculos = await respostaVeiculos.json()

        setCargas(dadosCargas)
        setMotoristas(dadosMotoristas)
        setVeiculos(dadosVeiculos)
    }

    useEffect(() => {
        carregarDados()
    }, [])

    function handleChange(
        event: React.ChangeEvent<HTMLSelectElement>
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
            const resposta = await fetch(
                "http://127.0.0.1:5000/api/admin/viagens",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            )

            if (!resposta.ok) {
                alert("Erro ao criar viagem.")
                return
            }

            navigate("/admin/viagens")
        } catch {
            alert("Erro ao conectar com servidor.")
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Nova Viagem</h1>

                        <p>
                            Planejamento operacional da viagem
                        </p>
                    </div>
                </div>

                <form
                    className="admin-form"
                    onSubmit={handleSubmit}
                >
                    <select
                        name="rastreamento_id"
                        value={formData.rastreamento_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Selecione a carga
                        </option>

                        {cargas.map((carga) => (
                            <option
                                key={carga.id}
                                value={carga.id}
                            >
                                {carga.codigo} - {carga.cliente}
                            </option>
                        ))}
                    </select>

                    <select
                        name="motorista_id"
                        value={formData.motorista_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Selecione o motorista
                        </option>

                        {motoristas.map((motorista) => (
                            <option
                                key={motorista.id}
                                value={motorista.id}
                            >
                                {motorista.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        name="veiculo_id"
                        value={formData.veiculo_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Selecione o veículo
                        </option>

                        {veiculos.map((veiculo) => (
                            <option
                                key={veiculo.id}
                                value={veiculo.id}
                            >
                                {veiculo.placa} - {veiculo.modelo}
                            </option>
                        ))}
                    </select>

                    <button
                        className="btn-nova-carga"
                        type="submit"
                    >
                        Criar Viagem
                    </button>
                </form>
            </div>
        </AdminLayout>
    )
}

export default NovaViagem
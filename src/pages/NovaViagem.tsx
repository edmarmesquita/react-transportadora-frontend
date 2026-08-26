import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"

type Carga = {
    id: number
    codigo: string
    cliente: string
    local_atual: string
    destino: string
    status: string
}

type Motorista = {
    id: number
    nome: string
    cpf: string
    cnh: string
    categoria_cnh: string
    status: string
}

type Veiculo = {
    id: number
    placa: string
    modelo: string
    marca: string
    tipo: string
    capacidade: string
    status: string
}

type OpcoesViagem = {
    cargas: Carga[]
    motoristas: Motorista[]
    veiculos: Veiculo[]
}

type FormDataViagem = {
    rastreamento_id: string
    motorista_id: string
    veiculo_id: string
    origem: string
    destino: string
    data_saida: string
    previsao_entrega: string
}

function NovaViagem() {
    const navigate = useNavigate()

    const [cargas, setCargas] = useState<Carga[]>([])
    const [motoristas, setMotoristas] = useState<Motorista[]>([])
    const [veiculos, setVeiculos] = useState<Veiculo[]>([])

    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState("")

    const [formData, setFormData] =
        useState<FormDataViagem>({
            rastreamento_id: "",
            motorista_id: "",
            veiculo_id: "",
            origem: "",
            destino: "",
            data_saida: "",
            previsao_entrega: "",
        })

    useEffect(() => {
        carregarDados()
    }, [])

    async function carregarDados() {
        try {
            setCarregando(true)
            setErro("")

            const resposta = await apiFetch(
                "/api/admin/viagens/opcoes"
            )

            const dados: OpcoesViagem & {
                erro?: string
                msg?: string
            } = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                    dados.msg ||
                    "Erro ao carregar os dados da viagem."
                )
            }

            setCargas(dados.cargas || [])
            setMotoristas(dados.motoristas || [])
            setVeiculos(dados.veiculos || [])
        } catch (erro) {
            if (erro instanceof Error) {
                setErro(erro.message)
            } else {
                setErro(
                    "Não foi possível carregar os dados."
                )
            }
        } finally {
            setCarregando(false)
        }
    }

    function handleChange(
        event:
            React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement
            >
    ) {
        const { name, value } = event.target

        setFormData((dadosAnteriores) => ({
            ...dadosAnteriores,
            [name]: value,
        }))
    }

    function selecionarCarga(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const cargaId = event.target.value

        const cargaSelecionada = cargas.find(
            (carga) =>
                carga.id === Number(cargaId)
        )

        setFormData((dadosAnteriores) => ({
            ...dadosAnteriores,
            rastreamento_id: cargaId,
            origem:
                cargaSelecionada?.local_atual || "",
            destino:
                cargaSelecionada?.destino || "",
        }))
    }

    function validarFormulario() {
        if (!formData.rastreamento_id) {
            setErro("Selecione uma carga.")
            return false
        }

        if (!formData.motorista_id) {
            setErro("Selecione um motorista.")
            return false
        }

        if (!formData.veiculo_id) {
            setErro("Selecione um veículo.")
            return false
        }

        if (!formData.origem.trim()) {
            setErro("Informe a origem da viagem.")
            return false
        }

        if (!formData.destino.trim()) {
            setErro("Informe o destino da viagem.")
            return false
        }

        if (
            formData.data_saida &&
            formData.previsao_entrega &&
            new Date(formData.previsao_entrega) <
            new Date(formData.data_saida)
        ) {
            setErro(
                "A previsão de entrega não pode ser anterior à saída."
            )

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
                "/api/admin/viagens/despachar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rastreamento_id: Number(
                            formData.rastreamento_id
                        ),

                        motorista_id: Number(
                            formData.motorista_id
                        ),

                        veiculo_id: Number(
                            formData.veiculo_id
                        ),

                        origem: formData.origem.trim(),

                        destino:
                            formData.destino.trim(),

                        data_saida:
                            formData.data_saida || null,

                        previsao_entrega:
                            formData.previsao_entrega ||
                            null,
                    }),
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                    dados.msg ||
                    "Erro ao despachar a viagem."
                )
            }

            alert(
                dados.mensagem ||
                "Viagem despachada com sucesso!"
            )

            navigate("/admin/viagens")
        } catch (erro) {
            if (erro instanceof Error) {
                setErro(erro.message)
            } else {
                setErro(
                    "Erro ao conectar com o servidor."
                )
            }
        } finally {
            setSalvando(false)
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Despacho de Viagem</h1>

                        <p>
                            Selecione a carga, o motorista
                            e o veículo para iniciar a
                            operação.
                        </p>
                    </div>
                </div>

                {carregando && (
                    <div className="admin-card">
                        <p>
                            Carregando opções de
                            viagem...
                        </p>
                    </div>
                )}

                {erro && (
                    <div className="mensagem-erro">
                        {erro}
                    </div>
                )}

                {!carregando && (
                    <form
                        className="admin-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="rastreamento_id">
                                Carga
                            </label>

                            <select
                                id="rastreamento_id"
                                name="rastreamento_id"
                                value={
                                    formData.rastreamento_id
                                }
                                onChange={selecionarCarga}
                                disabled={salvando}
                            >
                                <option value="">
                                    Selecione a carga
                                </option>

                                {cargas.map((carga) => (
                                    <option
                                        key={carga.id}
                                        value={carga.id}
                                    >
                                        {carga.codigo} -{" "}
                                        {carga.cliente}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="motorista_id">
                                Motorista
                            </label>

                            <select
                                id="motorista_id"
                                name="motorista_id"
                                value={
                                    formData.motorista_id
                                }
                                onChange={handleChange}
                                disabled={salvando}
                            >
                                <option value="">
                                    Selecione o motorista
                                </option>

                                {motoristas.map(
                                    (motorista) => (
                                        <option
                                            key={
                                                motorista.id
                                            }
                                            value={
                                                motorista.id
                                            }
                                        >
                                            {
                                                motorista.nome
                                            }

                                            {motorista.categoria_cnh
                                                ? ` - CNH ${motorista.categoria_cnh}`
                                                : ""}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="veiculo_id">
                                Veículo
                            </label>

                            <select
                                id="veiculo_id"
                                name="veiculo_id"
                                value={
                                    formData.veiculo_id
                                }
                                onChange={handleChange}
                                disabled={salvando}
                            >
                                <option value="">
                                    Selecione o veículo
                                </option>

                                {veiculos.map((veiculo) => (
                                    <option
                                        key={veiculo.id}
                                        value={veiculo.id}
                                    >
                                        {veiculo.placa}

                                        {veiculo.modelo
                                            ? ` - ${veiculo.modelo}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="origem">
                                    Origem
                                </label>

                                <input
                                    id="origem"
                                    name="origem"
                                    type="text"
                                    value={
                                        formData.origem
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Cidade ou endereço de origem"
                                    disabled={salvando}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="destino">
                                    Destino
                                </label>

                                <input
                                    id="destino"
                                    name="destino"
                                    type="text"
                                    value={
                                        formData.destino
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Cidade ou endereço de destino"
                                    disabled={salvando}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="data_saida">
                                    Data e hora da saída
                                </label>

                                <input
                                    id="data_saida"
                                    name="data_saida"
                                    type="datetime-local"
                                    value={
                                        formData.data_saida
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={salvando}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="previsao_entrega">
                                    Previsão de entrega
                                </label>

                                <input
                                    id="previsao_entrega"
                                    name="previsao_entrega"
                                    type="datetime-local"
                                    value={
                                        formData.previsao_entrega
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={salvando}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secundario"
                                onClick={() =>
                                    navigate(
                                        "/admin/viagens"
                                    )
                                }
                                disabled={salvando}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-nova-carga"
                                type="submit"
                                disabled={salvando}
                            >
                                {salvando
                                    ? "Iniciando viagem..."
                                    : "Iniciar Viagem"}
                            </button>
                        </div>
                    </form>
                )}

                {!carregando &&
                    cargas.length === 0 && (
                        <div className="admin-card">
                            <p>
                                Nenhuma carga disponível
                                para despacho.
                            </p>
                        </div>
                    )}
            </div>
        </AdminLayout>
    )
}

export default NovaViagem
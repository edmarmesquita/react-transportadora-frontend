import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../components/ui/NotificationProvider";
import { apiFetch } from "../services/api";
import { transicoesCarga } from "../constants/estadosOperacionais";
import "../styles/ui.css";

type Carga = {
    id: number;
    codigo: string;
    cliente: string;
    status: string;
    local_atual: string;
    destino: string;
    ultima_atualizacao: string;
    motorista_id: number | null;
    motorista: string;
    veiculo_id: number | null;
    veiculo: string;
    viagem_id: number | null;
};
type Motorista = {
    id: number;
    nome: string;
};

type Veiculo = {
    id: number;
    placa: string;
    modelo: string;
};

function CargaDetalhe() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { notificar } = useNotification();

    const [carga, setCarga] = useState<Carga | null>(null);
    const [viagemStatus, setViagemStatus] = useState("");
    const [loading, setLoading] = useState(true);

    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [motoristaId, setMotoristaId] = useState("");
    const [mensagemMotorista, setMensagemMotorista] = useState("");

    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [veiculoId, setVeiculoId] = useState("");
    const [mensagemVeiculo, setMensagemVeiculo] = useState("");

    const [novoStatus, setNovoStatus] = useState("");
    const [mensagemStatus, setMensagemStatus] = useState("");

    const [mensagemViagem, setMensagemViagem] = useState("");
    const [criandoViagem, setCriandoViagem] = useState(false);

    function statusTerminal(status: string | null | undefined) {
        const statusNormalizado = String(status || "")
            .trim()
            .toLowerCase();

        return ["entregue", "cancelada"].includes(statusNormalizado);
    }

    const operacaoFinalizada = (
        statusTerminal(carga?.status) || statusTerminal(viagemStatus)
    );

    async function carregarCarga() {
        try {
            const resposta = await apiFetch(
                `/api/admin/cargas/${id}`
            );

            const dados = await resposta.json();

            if (dados.viagem_id) {
                const respostaViagem = await apiFetch(
                    `/api/admin/viagens/${dados.viagem_id}`
                );

                if (respostaViagem.ok) {
                    const dadosViagem = await respostaViagem.json();
                    setViagemStatus(dadosViagem.status || "");
                } else {
                    setViagemStatus("");
                }
            } else {
                setViagemStatus("");
            }

            setCarga(dados);

            setMotoristaId(
                dados.motorista_id
                    ? String(dados.motorista_id)
                    : ""
            );

            setVeiculoId(
                dados.veiculo_id
                    ? String(dados.veiculo_id)
                    : ""
            );

            setNovoStatus(dados.status || "");

            setLoading(false);
        } catch (erro) {
            console.error(
                "Erro ao carregar carga:",
                erro
            );

            setLoading(false);
        }
    }

    async function carregarMotoristas() {
        try {
            const resposta = await apiFetch("/api/admin/motoristas");

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao carregar motoristas: ${resposta.status}`
                );
            }



            const dados = await resposta.json();

            setMotoristas(dados);
        } catch (erro) {
            setMensagemMotorista("Não foi possível carregar os motoristas.");
        }
    }

    async function carregarVeiculos() {
        try {
            const resposta = await apiFetch("/api/admin/veiculos");

            if (!resposta.ok) {
                throw new Error(
                    `Erro ao carregar veículos: ${resposta.status}`
                );
            }

            const dados = await resposta.json();

            setVeiculos(dados);
        } catch (erro) {
            console.error("Erro ao carregar veículos:", erro);
            setMensagemVeiculo(
                "Não foi possível carregar os veículos."
            );
        }
    }

    async function atribuirVeiculo() {
        if (!veiculoId) {
            setMensagemVeiculo("Selecione um veículo.");
            return;
        }

        if (!carga?.id) {
            setMensagemVeiculo(
                "Não foi possível identificar a carga."
            );
            return;
        }

        try {
            const resposta = await apiFetch(
                `/api/admin/cargas/${carga.id}/atribuir-veiculo`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        veiculo_id: Number(veiculoId),
                    }),
                }
            );

            const texto = await resposta.text();

            const dados = texto ? JSON.parse(texto) : {};

            if (!resposta.ok) {
                if (resposta.status === 409) {
                    notificar(
                        "aviso",
                        dados.erro ||
                        dados.mensagem ||
                        "Não foi possível alterar o veículo."
                    );
                    return;
                }

                throw new Error(
                    dados.erro ||
                    dados.mensagem ||
                    `Erro HTTP ${resposta.status}`
                );
            }

            setMensagemVeiculo(
                dados.mensagem ||
                "Veículo atribuído com sucesso!"
            );

            setTimeout(() => {
                setMensagemVeiculo("");
            }, 3000);

            await carregarCarga();
        } catch (erro) {
            console.error(
                "Erro completo ao atribuir veículo:",
                erro
            );

            if (erro instanceof Error) {
                setMensagemVeiculo(erro.message);
            } else {
                setMensagemVeiculo(
                    "Não foi possível atribuir o veículo."
                );
            }
        }
    }

    async function atualizarStatus() {
        if (!novoStatus) {
            setMensagemStatus("Selecione um status.");
            return;
        }

        if (!carga?.id) {
            setMensagemStatus(
                "Não foi possível identificar a carga."
            );
            return;
        }

        try {
            const resposta = await apiFetch(
                `/api/admin/cargas/${carga.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status: novoStatus,
                    }),
                }
            );

            const texto = await resposta.text();
            const dados = texto ? JSON.parse(texto) : {};

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                    dados.mensagem ||
                    `Erro HTTP ${resposta.status}`
                );
            }

            setMensagemStatus(
                dados.mensagem || "Status atualizado com sucesso!"
            );

            setTimeout(() => {
                setMensagemStatus("");
            }, 3000);

            await carregarCarga();
        } catch (erro) {
            console.error("Erro ao atualizar status:", erro);

            if (erro instanceof Error) {
                setMensagemStatus(erro.message);
            } else {
                setMensagemStatus(
                    "Não foi possível atualizar o status."
                );
            }
        }
    }
    
    useEffect(() => {
        carregarCarga();
        carregarMotoristas();
        carregarVeiculos();
    }, [id]);

    async function atribuirMotorista() {
        if (!motoristaId) {
            setMensagemMotorista("Selecione um motorista.");
            return;
        }

        if (!carga?.id) {
            setMensagemMotorista("Não foi possível identificar a carga.");
            return;
        }

        try {
            const resposta = await apiFetch(
                `/api/admin/cargas/${carga.id}/atribuir-motorista`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        motorista_id: Number(motoristaId),
                    }),
                }
            );

            const texto = await resposta.text();

            const dados = texto ? JSON.parse(texto) : {};

            if (!resposta.ok) {
                if (resposta.status === 409) {
                    notificar(
                        "aviso",
                        dados.erro ||
                        dados.mensagem ||
                        "Não foi possível alterar o motorista."
                    );
                    return;
                }

                throw new Error(
                    dados.erro ||
                    dados.mensagem ||
                    `Erro HTTP ${resposta.status}`
                );
            }

            setMensagemMotorista(
                dados.mensagem || "Motorista atribuído com sucesso!"
            );

            setTimeout(() => {
                setMensagemMotorista("");
            }, 3000);

            await carregarCarga();

        } catch (erro) {
            console.error(
                "Erro completo ao atribuir motorista:",
                erro
            );

            if (erro instanceof Error) {
                setMensagemMotorista(erro.message);
            } else {
                setMensagemMotorista(
                    "Não foi possível atribuir o motorista."
                );
            }
        
        }
    }

    async function criarViagem() {
        if (!carga?.id) {
            return;
        }

        try {
            setCriandoViagem(true);
            setMensagemViagem("");

            const resposta = await apiFetch(
                `/api/admin/cargas/${carga.id}/criar-viagem`,
                {
                    method: "POST",
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível criar a viagem."
                );
            }

            setMensagemViagem(
                dados.mensagem || "Viagem criada com sucesso!"
            );

            setTimeout(() => {
                setMensagemViagem("");
            }, 3000);

            await carregarCarga();
        } catch (erro) {
            console.error("Erro ao criar viagem:", erro);

            if (erro instanceof Error) {
                setMensagemViagem(erro.message);
            } else {
                setMensagemViagem(
                    "Não foi possível criar a viagem."
                );
            }
        } finally {
            setCriandoViagem(false);
        }
    }

    if (loading) {
        return <h1>Carregando carga...</h1>;
    }
    return (
        <div className="carga-detalhe-page">
            <div className="carga-detalhe-container">
                <div className="carga-detalhe-header">
                    <div>
                        <span className="carga-detalhe-subtitulo">
                            Central operacional
                        </span>

                        <h1>Detalhes da Carga</h1>

                        <p>
                            Gerencie motorista, veículo e status da operação.
                        </p>
                    </div>

                    <div className="carga-codigo-badge">
                        Carga #{carga?.codigo}
                    </div>
                </div>

                <section className="operacao-grid">
                    <div className="operacao-card">
                        <div className="operacao-card-topo">
                            <div>
                                <span className="operacao-label">Motorista</span>
                                <h2>Atribuir motorista</h2>
                            </div>

                            <span className="operacao-icone">👤</span>
                        </div>

                        {operacaoFinalizada ? (
                            <p className="mensagem-operacao">
                                Motorista utilizado: <strong>
                                    {carga?.motorista || "Não informado"}
                                </strong>
                            </p>
                        ) : (
                        <div className="operacao-controles">
                            <select
                                id="motorista"
                                name="motorista"
                                value={motoristaId}
                                onChange={(event) =>
                                    setMotoristaId(event.target.value)
                                }
                            >
                                <option value="">
                                    Selecione um motorista
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

                            <button
                                type="button"
                                onClick={atribuirMotorista}
                                disabled={!motoristaId}
                            >
                                Atribuir
                            </button>
                        </div>
                        )}

                        {mensagemMotorista && (
                            <p className="mensagem-operacao">
                                {mensagemMotorista}
                            </p>
                        )}
                    </div>

                    <div className="operacao-card">
                        <div className="operacao-card-topo">
                            <div>
                                <span className="operacao-label">Veículo</span>
                                <h2>Atribuir veículo</h2>
                            </div>

                            <span className="operacao-icone">🚛</span>
                        </div>

                        {operacaoFinalizada ? (
                            <p className="mensagem-operacao">
                                Veículo utilizado: <strong>
                                    {carga?.veiculo || "Não informado"}
                                </strong>
                            </p>
                        ) : (
                        <div className="operacao-controles">
                            <select
                                id="veiculo"
                                name="veiculo"
                                value={veiculoId}
                                onChange={(event) =>
                                    setVeiculoId(event.target.value)
                                }
                            >
                                <option value="">
                                    Selecione um veículo
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
                                type="button"
                                onClick={atribuirVeiculo}
                                disabled={!veiculoId}
                            >
                                Atribuir
                            </button>
                        </div>
                        )}

                        {mensagemVeiculo && (
                            <p className="mensagem-operacao">
                                {mensagemVeiculo}
                            </p>
                        )}
                    </div>

                    <div className="operacao-card">
                        <div className="operacao-card-topo">
                            <div>
                                <span className="operacao-label">Situação</span>
                                <h2>Atualizar status</h2>
                            </div>

                            <span className="operacao-icone">📦</span>
                        </div>

                        <div className="operacao-controles">
                            <select
                                id="status-carga"
                                name="status"
                                value={novoStatus}
                                onChange={(event) =>
                                    setNovoStatus(event.target.value)
                                }
                            >
                                <option value="">
                                    Selecione o status
                                </option>

                                {(transicoesCarga[carga?.status ?? ""] ?? []).map(
                                    (status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                type="button"
                                onClick={atualizarStatus}
                                disabled={
                                    !novoStatus
                                    || (transicoesCarga[carga?.status ?? ""] ?? []).length === 0
                                }
                            >
                                Atualizar
                            </button>
                        </div>

                        {mensagemStatus && (
                            <p className="mensagem-operacao">
                                {mensagemStatus}
                            </p>
                        )}
                    </div>

                    <div className="operacao-card">
                        <div className="operacao-card-topo">
                            <div>
                                <span className="operacao-label">
                                    Viagem
                                </span>

                                <h2>Operação da viagem</h2>
                            </div>

                            <span className="operacao-icone">
                                🚛
                            </span>
                        </div>

                        {carga?.viagem_id ? (
                            <>
                                <div className="viagem-status">
                                    <span className="viagem-status-badge viagem-ativa">
                                        Viagem vinculada
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn-operacao-viagem"
                                    onClick={() =>
                                        navigate(
                                            `/admin/viagens/${carga.viagem_id}`
                                        )
                                    }
                                >
                                    Abrir operação
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="viagem-status">
                                    <span className="viagem-status-badge viagem-pendente">
                                        Sem viagem vinculada
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn-operacao-viagem"
                                    onClick={criarViagem}
                                    disabled={criandoViagem}
                                >
                                    {criandoViagem
                                        ? "Criando..."
                                        : "Criar viagem"}
                                </button>
                            </>
                        )}

                        {mensagemViagem && (
                            <p className="mensagem-sucesso">
                                {mensagemViagem}
                            </p>
                        )}
                    </div>
                </section>

                <section className="resumo-carga-card">
                    <div className="resumo-carga-topo">
                        <div>
                            <span className="operacao-label">
                                Informações da operação
                            </span>

                            <h2>Resumo da carga</h2>
                        </div>

                        <span className="status-badge">
                            {carga?.status}
                        </span>
                    </div>

                    <div className="resumo-carga-grid">
                        <div className="resumo-item">
                            <span>Código</span>
                            <strong>{carga?.codigo}</strong>
                        </div>

                        <div className="resumo-item">
                            <span>Cliente</span>
                            <strong>{carga?.cliente}</strong>
                        </div>

                        <div className="resumo-item">
                            <span>Status</span>
                            <strong>{carga?.status}</strong>
                        </div>

                        <div className="resumo-item">
                            <span>Local atual</span>
                            <strong>{carga?.local_atual}</strong>
                        </div>

                        <div className="resumo-item">
                            <span>Destino</span>
                            <strong>{carga?.destino}</strong>
                        </div>

                        <div className="resumo-item">
                            <span>Última atualização</span>
                            <strong>
                                {carga?.ultima_atualizacao}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
export default CargaDetalhe;

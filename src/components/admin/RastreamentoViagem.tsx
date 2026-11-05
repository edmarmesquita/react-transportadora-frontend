import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { buscarUsuarioLogado } from "../../services/authService";
import { useNotification } from "../ui/NotificationProvider";

type Props = {
    viagemId: number;
    onLocalizacaoRegistrada?: () => Promise<void>;
    sectionId?: string;
};

type Localizacao = {
    id: number;
    localizacao: string;
    observacao: string;
    data_registro: string;
};

function RastreamentoViagem({ viagemId, onLocalizacaoRegistrada, sectionId }: Props) {
    const usuario = buscarUsuarioLogado();
    const ehMotorista = usuario?.perfil?.trim().toLowerCase() === "motorista";
    const { notificar } = useNotification();

    const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
    const [localizacao, setLocalizacao] = useState("");
    const [observacao, setObservacao] = useState("");

    async function carregarLocalizacoes() {
        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${viagemId}/localizacoes`
                : `/api/admin/viagens/${viagemId}/localizacoes`;

        const resposta = await apiFetch(endpoint);

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            throw new Error(
                dados?.erro ||
                dados?.msg ||
                "Não foi possível carregar as localizações."
            );
        }

        setLocalizacoes(
            Array.isArray(dados) ? dados : []
        );
    }

    async function salvarLocalizacao() {
        if (!localizacao.trim()) {
            notificar("aviso", "Informe a localização.");
            return;
        }

        const endpoint =
            usuario?.perfil?.toLowerCase() === "motorista"
                ? `/api/motorista/minhas-viagens/${viagemId}/localizacoes`
                : `/api/admin/viagens/${viagemId}/localizacoes`;

        const resposta = await apiFetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    localizacao: localizacao.trim(),
                    observacao: observacao.trim(),
                }),
            }
        );

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            notificar(
                "erro",
                dados?.erro ||
                dados?.msg ||
                "Não foi possível registrar a localização."
            );
            return;
        }

        notificar("sucesso", "Localização registrada com sucesso!");

        setLocalizacao("");
        setObservacao("");

        const recargaLocalizacoes = carregarLocalizacoes();
        const recargaTimeline = onLocalizacaoRegistrada?.().catch(() => {
            notificar("aviso", "Localização registrada, mas não foi possível atualizar a timeline.");
        });
        await Promise.allSettled([recargaLocalizacoes, recargaTimeline]);
    }

    useEffect(() => {
        carregarLocalizacoes().catch((erro) => {
            console.error(
                "Erro ao carregar localizações:",
                erro
            );
        });
    }, [viagemId]);

    return (
        <div className="grafico-card detalhe-viagem-card rastreamento-viagem-card" id={sectionId} tabIndex={sectionId ? -1 : undefined}>
            <h2>Rastreamento da Viagem</h2>

            <div className="admin-form detalhe-viagem-form">
                {ehMotorista && <label htmlFor="motorista-localizacao-manual">Localização atual</label>}
                <input
                    id={ehMotorista ? "motorista-localizacao-manual" : undefined}
                    placeholder="Localização atual. Ex: Uberaba/MG"
                    value={localizacao}
                    onChange={(e) =>
                        setLocalizacao(e.target.value)
                    }
                />

                {ehMotorista && <label htmlFor="motorista-observacao-localizacao">Observação (opcional)</label>}
                <textarea
                    id={ehMotorista ? "motorista-observacao-localizacao" : undefined}
                    placeholder="Observação"
                    value={observacao}
                    onChange={(e) =>
                        setObservacao(e.target.value)
                    }
                    rows={3}
                />

                <button
                    className="btn-primary"
                    onClick={salvarLocalizacao}
                >
                    Registrar Localização
                </button>
            </div>

            <div className="timeline-rastreamento">
                {localizacoes.length === 0 ? (
                    <p>
                        Nenhuma localização registrada até o momento.
                    </p>
                ) : (
                    localizacoes.map((item) => (
                        <div
                            key={item.id}
                            className="timeline-item"
                        >
                            <div className="timeline-marker" />

                            <div className="timeline-content">
                                <strong>
                                    {item.localizacao}
                                </strong>

                                <small>
                                    {item.data_registro}
                                </small>

                                {item.observacao && (
                                    <p>
                                        {item.observacao}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default RastreamentoViagem;

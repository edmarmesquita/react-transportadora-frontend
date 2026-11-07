import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import { buscarUsuarioLogado } from "../../services/authService";
import { useNotification } from "../ui/NotificationProvider";

function GpsLocalizacaoViagem({ viagemId }: { viagemId: number }) {
    const [capturando, setCapturando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [capturadaEm, setCapturadaEm] = useState("");
    const [precisao, setPrecisao] = useState<number | null>(null);

    function mensagemErroGeolocalizacao(erro: GeolocationPositionError) {
        if (erro.code === erro.PERMISSION_DENIED) {
            return "Permita o acesso à localização nas configurações do navegador para registrar sua posição.";
        }
        if (erro.code === erro.POSITION_UNAVAILABLE) {
            return "A localização está indisponível no momento. Tente novamente em um local com sinal GPS.";
        }
        if (erro.code === erro.TIMEOUT) {
            return "A localização demorou demais para responder. Tente novamente.";
        }
        return "Não foi possível obter a localização do dispositivo.";
    }

    function atualizarLocalizacao() {
        if (capturando) return;
        if (!navigator.geolocation?.getCurrentPosition) {
            setMensagem("Este navegador não oferece suporte à localização.");
            return;
        }

        setCapturando(true);
        setMensagem("Obtendo localização...");
        navigator.geolocation.getCurrentPosition(
            async (posicao) => {
                try {
                    const resposta = await apiFetch(
                        `/api/motorista/minhas-viagens/${viagemId}/localizacoes/gps`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                latitude: posicao.coords.latitude,
                                longitude: posicao.coords.longitude,
                                accuracy_m: posicao.coords.accuracy,
                                captured_at: new Date(posicao.timestamp).toISOString(),
                            }),
                        }
                    );
                    const dados = await resposta.json().catch(() => null);
                    if (!resposta.ok) {
                        throw new Error(dados?.erro || "Não foi possível registrar a localização.");
                    }

                    setMensagem("Localização atualizada.");
                    const instante = dados?.data_registro || new Date(posicao.timestamp).toISOString();
                    setCapturadaEm(new Date(instante).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                    }));
                    setPrecisao(Number.isFinite(posicao.coords.accuracy)
                        ? posicao.coords.accuracy
                        : null);
                } catch (erro) {
                    setMensagem(erro instanceof Error
                        ? erro.message
                        : "Não foi possível registrar a localização.");
                } finally {
                    setCapturando(false);
                }
            },
            (erro) => {
                setMensagem(mensagemErroGeolocalizacao(erro));
                setCapturando(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            }
        );
    }

    return (
        <div className="motorista-gps-localizacao">
            <button
                type="button"
                className="btn-primary motorista-gps-botao"
                onClick={atualizarLocalizacao}
                disabled={capturando}
                style={{ minHeight: 52, width: "100%" }}
            >
                {capturando ? "Obtendo localização..." : "Atualizar localização por GPS"}
            </button>
            {mensagem && <p role="status" aria-live="polite">{mensagem}</p>}
            {capturadaEm && (
                <small>
                    Atualizada em {capturadaEm}
                    {precisao !== null ? ` · Precisão do GPS: ${Math.round(precisao)} m` : ""}
                </small>
            )}
        </div>
    );
}

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
                {ehMotorista && <GpsLocalizacaoViagem viagemId={viagemId} />}
                {ehMotorista && <label htmlFor="motorista-localizacao-manual">Localização atual (manual)</label>}
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
                    {ehMotorista ? "Registrar localização manual" : "Registrar Localização"}
                </button>
            </div>

            <div className="timeline-rastreamento">
                {ehMotorista && <h3>Histórico de localizações manuais</h3>}
                {localizacoes.length === 0 ? (
                    <p>
                        {ehMotorista
                            ? "Nenhuma localização manual registrada até o momento."
                            : "Nenhuma localização registrada até o momento."}
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

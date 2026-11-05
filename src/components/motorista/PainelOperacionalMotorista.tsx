import { useEffect, useRef, useState } from "react";
import { transicoesViagem } from "../../constants/estadosOperacionais";

type ViagemOperacional = {
    codigo_carga?: string | null;
    origem?: string | null;
    destino?: string | null;
    status: string;
    veiculo?: string | null;
    data_saida?: string | null;
    previsao_entrega?: string | null;
};

type Props = {
    viagem: ViagemOperacional;
    onAtualizarStatus: (status: string) => Promise<boolean>;
};

function valor(texto?: string | null) {
    return texto?.trim() || "Não informado";
}

function focarSecao(id: string) {
    const secao = document.getElementById(id);
    secao?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    secao?.focus({ preventScroll: true });
}

export default function PainelOperacionalMotorista({ viagem, onAtualizarStatus }: Props) {
    const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const abrirRef = useRef<HTMLButtonElement>(null);
    const cancelarRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const destino = viagem.destino?.trim();
    const destinoValido = Boolean(destino && !["null", "undefined"].includes(destino.toLowerCase()));
    const maps = destinoValido ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino!)}&travelmode=driving` : null;
    const waze = destinoValido ? `https://waze.com/ul?q=${encodeURIComponent(destino!)}&navigate=yes` : null;
    const proximaAcao = viagem.status === "Saiu para entrega"
        ? null
        : (transicoesViagem[viagem.status] ?? []).find((status) => status !== "Cancelada") ?? null;

    useEffect(() => {
        if (!confirmacaoAberta) return;
        cancelarRef.current?.focus();
        function aoTeclar(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !enviando) {
                evento.preventDefault();
                setConfirmacaoAberta(false);
                abrirRef.current?.focus();
            }
            if (evento.key !== "Tab" || !dialogRef.current) return;
            const botoes = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
            const primeiro = botoes[0];
            const ultimo = botoes[botoes.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault();
                ultimo?.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primeiro?.focus();
            }
        }
        document.addEventListener("keydown", aoTeclar);
        return () => document.removeEventListener("keydown", aoTeclar);
    }, [confirmacaoAberta, enviando]);

    async function confirmar() {
        if (!proximaAcao || enviando) return;
        setEnviando(true);
        try {
            if (await onAtualizarStatus(proximaAcao)) {
                setConfirmacaoAberta(false);
                abrirRef.current?.focus();
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section className="motorista-operacional" aria-labelledby="motorista-operacional-titulo">
            <div className="motorista-operacional-topo">
                <div>
                    <span className="motorista-operacional-sobretitulo">Sua viagem</span>
                    <h2 id="motorista-operacional-titulo">Rota da viagem</h2>
                </div>
                <span className="motorista-operacional-status">Status atual: {valor(viagem.status)}</span>
            </div>
            <div className="motorista-operacional-rota">
                <div><span>Origem</span><strong>{valor(viagem.origem)}</strong></div>
                <span aria-hidden="true" className="motorista-operacional-seta">→</span>
                <div><span>Destino</span><strong>{valor(viagem.destino)}</strong></div>
            </div>
            <div className="motorista-operacional-dados">
                <span>Placa <strong>{valor(viagem.veiculo)}</strong></span>
                <span>Código <strong>{valor(viagem.codigo_carga)}</strong></span>
                {viagem.data_saida?.trim() && <span>Saída real <strong>{viagem.data_saida}</strong></span>}
                {viagem.previsao_entrega?.trim() && <span>Previsão de entrega <strong>{viagem.previsao_entrega}</strong></span>}
            </div>
            <div className="motorista-operacional-acoes" aria-label="Ações rápidas da viagem">
                {maps ? <a href={maps} target="_blank" rel="noopener noreferrer" aria-label="Abrir destino no Google Maps (abre em nova aba)">Google Maps</a> : <span aria-disabled="true" title="Destino indisponível">Google Maps indisponível</span>}
                {waze ? <a href={waze} target="_blank" rel="noopener noreferrer" aria-label="Abrir destino no Waze (abre em nova aba)">Waze</a> : <span aria-disabled="true" title="Destino indisponível">Waze indisponível</span>}
                <button type="button" onClick={() => focarSecao("motorista-localizacao")}>Atualizar localização</button>
                <button type="button" onClick={() => focarSecao("motorista-ocorrencia")}>Registrar ocorrência</button>
            </div>
            {proximaAcao && (
                <div className="motorista-operacional-proxima">
                    <p>Próxima ação operacional</p>
                    <button type="button" ref={abrirRef} onClick={() => setConfirmacaoAberta(true)}>
                        Marcar como {proximaAcao.toLowerCase()}
                    </button>
                </div>
            )}
            {confirmacaoAberta && proximaAcao && (
                <div className="confirmacao-entrega" role="presentation">
                    <div ref={dialogRef} className="confirmacao-entrega-conteudo" role="dialog" aria-modal="true" aria-labelledby="motorista-confirmacao-titulo" aria-describedby="motorista-confirmacao-mensagem">
                        <h3 id="motorista-confirmacao-titulo">Confirmar alteração de status</h3>
                        <p id="motorista-confirmacao-mensagem">Status atual: {viagem.status}. Novo status: {proximaAcao}. Esta alteração será registrada na Timeline da viagem.</p>
                        <div className="confirmacao-entrega-acoes">
                            <button type="button" ref={cancelarRef} className="confirmacao-entrega-cancelar" onClick={() => { setConfirmacaoAberta(false); abrirRef.current?.focus(); }} disabled={enviando}>Cancelar</button>
                            <button type="button" className="btn-primary" onClick={() => void confirmar()} disabled={enviando}>{enviando ? "Atualizando..." : "Confirmar alteração"}</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

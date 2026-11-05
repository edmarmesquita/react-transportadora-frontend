import { Link } from "react-router-dom";
import type { MinhaViagem } from "../../types/minhaViagem";

type Props = { viagem: MinhaViagem; historico?: boolean };

function texto(valor?: string | null) {
    return valor?.trim() || "Não informado";
}

function ViagemMotoristaCard({ viagem, historico = false }: Props) {
    const codigo = texto(viagem.carga_codigo);
    return (
        <article className={`motorista-viagem-card${historico ? " motorista-viagem-card-historico" : ""}`}>
            <div className="motorista-card-topo">
                <span className="motorista-card-codigo">{codigo}</span>
                <span className="motorista-card-status">{texto(viagem.status)}</span>
            </div>
            <div className="motorista-card-rota" aria-label={`De ${texto(viagem.origem)} para ${texto(viagem.destino)}`}>
                <div><span>Origem</span><strong>{texto(viagem.origem)}</strong></div>
                <span className="motorista-card-seta" aria-hidden="true">→</span>
                <div><span>Destino</span><strong>{texto(viagem.destino)}</strong></div>
            </div>
            <div className="motorista-card-rodape">
                <div className="motorista-card-dados">
                    <span>Placa <strong>{texto(viagem.veiculo)}</strong></span>
                    {!historico && viagem.data_saida?.trim() && <span>Saída real <strong>{viagem.data_saida}</strong></span>}
                    {!historico && viagem.previsao_entrega?.trim() && <span>Previsão de entrega <strong>{viagem.previsao_entrega}</strong></span>}
                </div>
                <Link to={`/portal/motorista/minhas-viagens/${viagem.id}`} className="motorista-card-abrir" aria-label={`Abrir viagem ${codigo}`}>
                    Abrir viagem
                </Link>
            </div>
        </article>
    );
}

export default ViagemMotoristaCard;

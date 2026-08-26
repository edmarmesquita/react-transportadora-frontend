import {
    PackageCheck,
    Truck,
    MapPin,
    Warehouse,
    CircleCheck,
    TriangleAlert,
    Circle,
} from "lucide-react";

import type { EventoRastreamento } from "../../types/minhaCarga";

type TimelineRastreamentoProps = {
    historico: EventoRastreamento[];
};

function escolherIcone(status: string) {
    const statusNormalizado = status.toLowerCase();

    if (
        statusNormalizado.includes("entregue") ||
        statusNormalizado.includes("finalizada")
    ) {
        return CircleCheck;
    }

    if (
        statusNormalizado.includes("ocorrência") ||
        statusNormalizado.includes("atrasada") ||
        statusNormalizado.includes("problema")
    ) {
        return TriangleAlert;
    }

    if (
        statusNormalizado.includes("coleta") ||
        statusNormalizado.includes("criada")
    ) {
        return PackageCheck;
    }

    if (
        statusNormalizado.includes("centro") ||
        statusNormalizado.includes("depósito")
    ) {
        return Warehouse;
    }

    if (
        statusNormalizado.includes("trânsito") ||
        statusNormalizado.includes("entrega")
    ) {
        return Truck;
    }

    if (
        statusNormalizado.includes("local") ||
        statusNormalizado.includes("chegou")
    ) {
        return MapPin;
    }

    return Circle;
}

function TimelineRastreamento({
    historico,
}: TimelineRastreamentoProps) {
    if (historico.length === 0) {
        return (
            <p className="timeline-vazia">
                Nenhuma atualização registrada até o momento.
            </p>
        );
    }

    return (
        <div className="timeline-carga">
            {historico.map((evento, index) => {
                const Icone = escolherIcone(evento.status);
                const ultimoEvento =
                    index === historico.length - 1;

                return (
                    <div
                        className={`timeline-evento ${ultimoEvento
                                ? "timeline-evento-atual"
                                : ""
                            }`}
                        key={evento.id}
                    >
                        <div className="timeline-coluna">
                            <div className="timeline-marcador">
                                <Icone size={18} />
                            </div>

                            {!ultimoEvento && (
                                <div className="timeline-linha" />
                            )}
                        </div>

                        <div className="timeline-conteudo">
                            <div className="timeline-cabecalho">
                                <div>
                                    <div>
                                        <strong>
                                            {evento.status}
                                        </strong>

                                        {ultimoEvento && (
                                            <span className="timeline-badge-atual">
                                                Atual
                                            </span>
                                        )}
                                    </div> 

                                    {ultimoEvento && (
                                        <span className="timeline-badge-atual">
                                            Atual
                                        </span>
                                    )}
                                </div>

                                <small>
                                    {evento.data_evento}
                                </small>
                            </div>

                            <div className="timeline-local">
                                <MapPin size={15} />

                                <span>
                                    {evento.local ||
                                        "Local não informado"}
                                </span>
                            </div>

                            {evento.observacao && (
                                <div className="timeline-observacao">
                                    {evento.observacao}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
export default TimelineRastreamento;
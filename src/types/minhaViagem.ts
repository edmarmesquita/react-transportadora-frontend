export type MinhaViagem = {
    id: number;
    origem: string;
    destino: string;
    status: string;
    data_saida?: string | null;
    previsao_entrega?: string | null;
    carga_codigo: string;
    veiculo: string;
};

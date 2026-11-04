export type MinhaCarga = {
    id: number;
    codigo: string;
    cliente: string;
    status: string;
    local_atual: string;
    destino: string;
    ultima_atualizacao: string;
    descricao_carga?: string | null;
    peso_kg?: number | null;
    data_prevista_saida?: string | null;
    previsao_entrega?: string | null;
};

export type DetalheMinhaCarga = {
    id: number;
    codigo: string;
    cliente: string;
    status: string;
    local_atual: string;
    destino: string;
    ultima_atualizacao: string;
    historico: EventoRastreamento[];
    descricao_carga?: string | null;
    peso_kg?: number | null;
    data_prevista_saida?: string | null;
    previsao_entrega?: string | null;
};

export type EventoRastreamento = {
    id: number;
    status: string;
    local: string;
    observacao: string;
    data_evento: string;
};

export type OcorrenciaCarga = {
    id: number;
    titulo: string;
    descricao: string;
    data_ocorrencia: string;
};

export type NovaOcorrenciaCarga = {
    titulo: string;
    descricao: string;
};

export type ComprovanteCarga = {
    id: number;
    viagem_id: number;
    recebedor: string;
    observacao: string;
    data_entrega: string;
};

export type ArquivoComprovanteCarga = {
    id: number;
    nome_arquivo: string;
    data_upload: string;
    download_endpoint: string;
};

export type ComprovantesCargaResponse = {
    comprovantes: ComprovanteCarga[];
    arquivos: ArquivoComprovanteCarga[];
};

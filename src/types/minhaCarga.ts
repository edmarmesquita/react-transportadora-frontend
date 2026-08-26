export type MinhaCarga = {
    id: number;
    codigo: string;
    cliente: string;
    status: string;
    local_atual: string;
    destino: string;
    ultima_atualizacao: string;
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
    url: string;
};

export type ComprovantesCargaResponse = {
    comprovantes: ComprovanteCarga[];
    arquivos: ArquivoComprovanteCarga[];
};

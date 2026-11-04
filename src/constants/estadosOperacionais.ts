export const transicoesCarga: Record<string, string[]> = {
    Pendente: ["Programada", "Em preparação"],
    Programada: ["Em preparação"],
    "Em preparação": ["Em coleta"],
    "Em coleta": ["Carregando"],
}

export const transicoesViagem: Record<string, string[]> = {
    // O backend mantém transições históricas para Planejada, mas o fluxo
    // operacional atual inicia a viagem diretamente em trânsito.
    Planejada: ["Em trânsito", "Cancelada"],
    "Em andamento": [
        "Em coleta",
        "Carregando",
        "Em trânsito",
        "Parada operacional",
        "Saiu para entrega",
        "Cancelada",
    ],
    "Em preparação": ["Em coleta"],
    "Em coleta": ["Carregando"],
    Carregando: ["Em trânsito"],
    "Em trânsito": ["Saiu para entrega"],
    "Parada operacional": ["Em trânsito", "Saiu para entrega", "Cancelada"],
    "Saiu para entrega": ["Entregue"],
    Entregue: [],
    Finalizada: [],
    Cancelada: [],
}

export const transicoesCarga: Record<string, string[]> = {
    Pendente: ["Programada", "Em preparação"],
    Programada: ["Em preparação"],
    "Em preparação": ["Carregando"],
}

export const transicoesViagem: Record<string, string[]> = {
    Planejada: ["Em coleta", "Carregando", "Em trânsito", "Cancelada"],
    "Em andamento": [
        "Em coleta", "Carregando", "Em trânsito",
        "Parada operacional", "Saiu para entrega", "Cancelada",
    ],
    "Em coleta": ["Carregando", "Em trânsito", "Cancelada"],
    Carregando: ["Em trânsito", "Cancelada"],
    "Em trânsito": ["Parada operacional", "Saiu para entrega", "Cancelada"],
    "Parada operacional": ["Em trânsito", "Saiu para entrega", "Cancelada"],
    "Saiu para entrega": ["Cancelada"],
}

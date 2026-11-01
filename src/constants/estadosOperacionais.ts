export const transicoesCarga: Record<string, string[]> = {
    Pendente: ["Programada", "Em preparação"],
    Programada: ["Em preparação"],
    "Em preparação": ["Em coleta"],
    "Em coleta": ["Carregando"],
}

export const transicoesViagem: Record<string, string[]> = {
    Planejada: ["Em coleta", "Cancelada"],
    "Em andamento": ["Em coleta", "Cancelada"],
    "Em coleta": ["Carregando", "Cancelada"],
    Carregando: ["Em trânsito", "Cancelada"],
    "Em trânsito": ["Parada operacional", "Saiu para entrega", "Cancelada"],
    "Parada operacional": ["Em trânsito", "Saiu para entrega", "Cancelada"],
    "Saiu para entrega": ["Entregue", "Cancelada"],
}

import { useEffect, useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import { apiFetch } from "../services/api"

type RelatorioResumo = {
    clientes: {
        total: number
        ativos: number
        inativos: number
    }
    motoristas: {
        total: number
        ativos: number
        inativos: number
    }
    veiculos: {
        total: number
        disponiveis: number
        manutencao: number
        inativos: number
    }
    viagens: {
        total: number
        planejadas: number
        em_transito: number
        entregues: number
    }
}

function AdminRelatorios() {
    const [resumo, setResumo] = useState<RelatorioResumo | null>(null)

    async function carregarResumo() {
        const resposta = await apiFetch(
            "/api/admin/relatorios/resumo"
        )

        const dados = await resposta.json()

        setResumo(dados)
    }

    useEffect(() => {
        carregarResumo()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Relatórios Operacionais</h1>
                        <p>Resumo gerencial da operação da Transportadora Ramos</p>
                    </div>
                </div>
                <button
                    className="btn-nova-carga"
                    onClick={() => window.print()}
                >
                    Imprimir Relatório
                </button>

                <div className="cabecalho-relatorio">
                    <h2>Transportadora Ramos</h2>
                    <p>Relatório Operacional Gerencial</p>
                    <span>Gerado em: {new Date().toLocaleString("pt-BR")}</span>
                </div>

                {resumo && (
                    <div className="relatorios-grid">
                        <div className="relatorio-card">
                            <h2>Clientes</h2>
                            <p>Total: <strong>{resumo.clientes.total}</strong></p>
                            <p>Ativos: <strong>{resumo.clientes.ativos}</strong></p>
                            <p>Inativos: <strong>{resumo.clientes.inativos}</strong></p>
                        </div>

                        <div className="relatorio-card">
                            <h2>Motoristas</h2>
                            <p>Total: <strong>{resumo.motoristas.total}</strong></p>
                            <p>Ativos: <strong>{resumo.motoristas.ativos}</strong></p>
                            <p>Inativos: <strong>{resumo.motoristas.inativos}</strong></p>
                        </div>

                        <div className="relatorio-card">
                            <h2>Veículos</h2>
                            <p>Total: <strong>{resumo.veiculos.total}</strong></p>
                            <p>Disponíveis: <strong>{resumo.veiculos.disponiveis}</strong></p>
                            <p>Manutenção: <strong>{resumo.veiculos.manutencao}</strong></p>
                            <p>Inativos: <strong>{resumo.veiculos.inativos}</strong></p>
                        </div>

                        <div className="relatorio-card">
                            <h2>Viagens</h2>
                            <p>Total: <strong>{resumo.viagens.total}</strong></p>
                            <p>Planejadas: <strong>{resumo.viagens.planejadas}</strong></p>
                            <p>Em trânsito: <strong>{resumo.viagens.em_transito}</strong></p>
                            <p>Entregues: <strong>{resumo.viagens.entregues}</strong></p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminRelatorios

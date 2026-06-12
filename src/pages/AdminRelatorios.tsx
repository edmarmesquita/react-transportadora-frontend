import AdminLayout from "../components/admin/AdminLayout"

function AdminRelatorios() {
    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Relatórios</h1>
                        <p>Indicadores e relatórios operacionais da transportadora</p>
                    </div>
                </div>

                <div className="tabela-cargas">
                    <h2>Relatórios Disponíveis</h2>

                    <div className="relatorios-grid">
                        <div className="relatorio-card">
                            <h3>Relatório de Viagens</h3>
                            <p>Baixe um PDF com todas as viagens cadastradas.</p>

                            <a
                                href="http://127.0.0.1:5000/api/admin/relatorios/viagens/pdf"
                                className="btn-nova-carga"
                                target="_blank"
                            >
                                Baixar PDF
                            </a>
                        </div>
                    </div>
                    
                    <div className="relatorio-card">
                        <h3>Relatório Financeiro</h3>

                        <p>
                            Resumo financeiro da operação.
                        </p>

                        <a
                            href="http://127.0.0.1:5000/api/admin/relatorios/financeiro/pdf"
                            className="btn-nova-carga"
                            target="_blank"
                        >
                            Baixar PDF
                        </a>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminRelatorios
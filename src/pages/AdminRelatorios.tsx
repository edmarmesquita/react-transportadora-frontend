import { useEffect, useRef, useState } from "react"
import AdminLayout from "../components/admin/AdminLayout"
import { useNotification } from "../components/ui/NotificationProvider"
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

type IdentidadeTransportadora = {
    nome_exibicao: string | null
    logo: string | null
}

function AdminRelatorios() {
    const { notificar } = useNotification()
    const [resumo, setResumo] = useState<RelatorioResumo | null>(null)
    const [nomeTransportadora, setNomeTransportadora] = useState("TRANSPORTADORA")
    const [urlLogo, setUrlLogo] = useState<string | null>(null)
    const [carregandoIdentidade, setCarregandoIdentidade] = useState(true)
    const tituloAnterior = useRef<string | null>(null)

    async function carregarResumo() {
        const resposta = await apiFetch(
            "/api/admin/relatorios/resumo"
        )

        const dados = await resposta.json()

        setResumo(dados)
    }

    async function baixarPdf(rota: string, nomeArquivo: string, mensagemErro: string) {
        try {
            const resposta = await apiFetch(rota)

            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => null)
                throw new Error(
                    dados?.erro || mensagemErro
                )
            }

            const arquivo = await resposta.blob()
            const url = URL.createObjectURL(arquivo)
            const link = document.createElement("a")
            let downloadIniciado = false
            try {
                link.href = url
                link.download = nomeArquivo
                document.body.appendChild(link)
                link.click()
                downloadIniciado = true
            } finally {
                link.remove()
                if (downloadIniciado) {
                    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
                } else {
                    URL.revokeObjectURL(url)
                }
            }
        } catch (erro) {
            notificar(
                "erro",
                erro instanceof Error
                    ? erro.message
                    : mensagemErro
            )
        }
    }

    useEffect(() => {
        let ativo = true
        async function carregarIdentidade() {
            try {
                const resposta = await apiFetch("/api/configuracao/transportadora")
                const dados = await resposta.json().catch(() => null) as IdentidadeTransportadora | null
                if (!resposta.ok) throw new Error("Não foi possível carregar a identidade da transportadora.")
                if (!ativo) return
                setNomeTransportadora(dados?.nome_exibicao?.trim() || "TRANSPORTADORA")

                if (dados?.logo) {
                    const respostaLogo = await apiFetch("/api/configuracao/transportadora/logo")
                    if (respostaLogo.status === 404) return
                    if (!respostaLogo.ok) throw new Error("Não foi possível carregar o logotipo da transportadora.")
                    const arquivo = await respostaLogo.blob()
                    if (ativo) setUrlLogo(URL.createObjectURL(arquivo))
                }
            } catch (erro) {
                if (ativo) notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.")
            } finally {
                if (ativo) setCarregandoIdentidade(false)
            }
        }
        void carregarIdentidade()
        return () => { ativo = false }
    }, [notificar])

    useEffect(() => () => {
        if (urlLogo) URL.revokeObjectURL(urlLogo)
    }, [urlLogo])

    useEffect(() => {
        function antesDaImpressao() {
            if (tituloAnterior.current === null) tituloAnterior.current = document.title
            document.title = `Relatório Operacional - ${nomeTransportadora}`
        }
        function depoisDaImpressao() {
            if (tituloAnterior.current !== null) {
                document.title = tituloAnterior.current
                tituloAnterior.current = null
            }
        }
        window.addEventListener("beforeprint", antesDaImpressao)
        window.addEventListener("afterprint", depoisDaImpressao)
        return () => {
            window.removeEventListener("beforeprint", antesDaImpressao)
            window.removeEventListener("afterprint", depoisDaImpressao)
            depoisDaImpressao()
        }
    }, [nomeTransportadora])

    useEffect(() => {
        carregarResumo()
    }, [])

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Relatórios Operacionais</h1>
                        <p>Resumo gerencial da operação de transportes</p>
                    </div>
                </div>
                <div className="relatorios-actions">
                    <button
                        className="btn-nova-carga"
                        disabled={carregandoIdentidade}
                        onClick={() => window.print()}
                    >
                        Imprimir Relatório
                    </button>

                    <button
                        className="btn-nova-carga"
                        onClick={() => void baixarPdf(
                            "/api/admin/relatorios/viagens/pdf",
                            "relatorio_viagens.pdf",
                            "Não foi possível baixar o relatório de viagens."
                        )}
                    >
                        Baixar Viagens em PDF
                    </button>

                    <button
                        className="btn-nova-carga"
                        onClick={() => void baixarPdf(
                            "/api/admin/relatorios/financeiro/pdf",
                            "relatorio_financeiro.pdf",
                            "Não foi possível baixar o relatório financeiro."
                        )}
                    >
                        Baixar Financeiro em PDF
                    </button>
                </div>

                <div className="cabecalho-relatorio">
                    <div className="relatorio-identidade">
                        {urlLogo && <img src={urlLogo} alt={`Logotipo de ${nomeTransportadora}`} />}
                        <strong>{nomeTransportadora}</strong>
                    </div>
                    <h2>Relatório Operacional</h2>
                    <p>Resumo Gerencial de Transportes</p>
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

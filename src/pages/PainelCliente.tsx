import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import DataTable from "../components/ui/DataTable";
import { listarMinhasCargas } from "../services/clienteService";
import type { MinhaCarga } from "../types/minhaCarga";
import { Link } from "react-router-dom";

function PainelCliente() {
    const [cargas, setCargas] = useState<MinhaCarga[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarCargas();
    }, []);

    async function carregarCargas() {
        try {
            setErro("");

            const dados = await listarMinhasCargas();
            setCargas(dados);
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível carregar suas cargas.");
            }
        } finally {
            setCarregando(false);
        }
    }

    const cargasEmAndamento = cargas.filter(
        (carga) =>
            carga.status !== "Entregue" &&
            carga.status !== "Cancelada"
    ).length;

    const cargasEmTransito = cargas.filter(
        (carga) =>
            carga.status === "Em trânsito" ||
            carga.status === "Saiu para entrega"
    ).length;

    const cargasEntregues = cargas.filter(
        (carga) => carga.status === "Entregue"
    ).length;

    const ultimaCarga = cargas[0];

    return (
        <AdminLayout>
            <div className="admin-page">

                <section className="cliente-resumo">
                    <div className="cliente-boas-vindas">
                        <span>Portal do Cliente</span>

                        <h2>Bem-vindo ao seu espaço</h2>

                        <p>
                            Acompanhe suas cargas, movimentações,
                            entregas e ocorrências em um só lugar.
                        </p>
                    </div>
                    <div className="cliente-resumo-grid">
                        <div className="cliente-resumo-card">
                            <span className="cliente-resumo-icone">
                                📦
                            </span>

                            <div>
                                <strong>{cargasEmAndamento}</strong>
                                <p>Em andamento</p>
                            </div>
                        </div>

                        <div className="cliente-resumo-card">
                            <span className="cliente-resumo-icone">
                                🚚
                            </span>

                            <div>
                                <strong>{cargasEmTransito}</strong>
                                <p>Em trânsito</p>
                            </div>
                        </div>

                        <div className="cliente-resumo-card">
                            <span className="cliente-resumo-icone">
                                ✅
                            </span>

                            <div>
                                <strong>{cargasEntregues}</strong>
                                <p>Entregues</p>
                            </div>
                        </div>

                        <div className="cliente-resumo-card">
                            <span className="cliente-resumo-icone">
                                📋
                            </span>

                            <div>
                                <strong>{cargas.length}</strong>
                                <p>Total de cargas</p>
                            </div>
                        </div>
                    </div>

                    {ultimaCarga ? (
                        <div className="cliente-ultima-carga">
                            <div>
                                <span className="cliente-ultima-label">
                                    Última movimentação
                                </span>

                                <h3>{ultimaCarga.codigo}</h3>
                            </div>

                            <div className="cliente-ultima-info">
                                <p>
                                    <strong>Status:</strong>{" "}
                                    {ultimaCarga.status}
                                </p>

                                <p>
                                    <strong>Local atual:</strong>{" "}
                                    {ultimaCarga.local_atual || "Não informado"}
                                </p>

                                <p>
                                    <strong>Destino:</strong>{" "}
                                    {ultimaCarga.destino}
                                </p>

                                <p>
                                    <strong>Atualizado em:</strong>{" "}
                                    {ultimaCarga.ultima_atualizacao || "-"}
                                </p>
                            </div>

                            <a
                                href="#minhas-cargas"
                                className="btn-primary"
                            >
                                Ver Minhas Cargas
                            </a>
                        </div>
                    ) : (
                        <div className="cliente-sem-cargas">
                            <h3>Nenhuma carga vinculada</h3>

                            <p>
                                Assim que uma carga for vinculada ao seu
                                cadastro, ela aparecerá automaticamente
                                neste portal.
                            </p>
                        </div>
                    )}
                </section>

                <div
                    id="minhas-cargas"
                    className="cliente-cargas-titulo"
                >
                    <div>
                        <span>Operações</span>
                        <h2>Minhas Cargas</h2>
                    </div>
                </div>

                {carregando && <p>Carregando suas cargas...</p>}

                {!carregando && erro && (
                    <p className="mensagem-erro">{erro}</p>
                )}

                {!carregando && !erro && (
                    <DataTable<MinhaCarga>
                        columns={[
                            "Código",
                            "Status",
                            "Local atual",
                            "Destino",
                            "Última atualização",
                            "Ações",
                        ]}
                        data={cargas}
                        searchable
                        searchPlaceholder="Pesquisar cargas..."
                        searchFields={[
                            "codigo",
                            "status",
                            "local_atual",
                            "destino",
                        ]}
                        emptyMessage="Nenhuma carga vinculada a este cliente."
                        renderRow={(carga) => (
                            <>
                                <td>{carga.codigo}</td>
                                <td>{carga.status}</td>
                                <td>{carga.local_atual || "-"}</td>
                                <td>{carga.destino || "-"}</td>
                                <td>{carga.ultima_atualizacao || "-"}</td>
                                <td>
                                    <Link
                                        to={`/portal/cliente/minhas-cargas/${carga.id}`}
                                        className="btn-small btn-edit"
                                    >
                                        Detalhes
                                    </Link>
                                </td>
                            </>
                        )}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

export default PainelCliente;
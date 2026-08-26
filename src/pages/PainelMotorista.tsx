import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import DataTable from "../components/ui/DataTable";

import { listarMinhasViagens } from "../services/motoristaService";
import type { MinhaViagem } from "../types/minhaViagem";


function PainelMotorista() {
    const [viagens, setViagens] = useState<MinhaViagem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarViagens();
    }, []);

    async function carregarViagens() {
        try {
            setErro("");

            const dados = await listarMinhasViagens();
            setViagens(dados);
        } catch (error) {
            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível carregar suas viagens.");
            }
        } finally {
            setCarregando(false);
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <AdminHeader
                    title="Minhas Viagens"
                    subtitle="Acompanhe somente as viagens vinculadas ao seu cadastro."
                />

                {carregando && <p>Carregando suas viagens...</p>}

                {!carregando && erro && (
                    <p className="mensagem-erro">{erro}</p>
                )}

                {!carregando && !erro && (
                    <DataTable<MinhaViagem>
                        columns={[
                            "Carga",
                            "Origem",
                            "Destino",
                            "Status",
                            "Veículo",
                            "Saída",
                            "Previsão",
                            "Ações",
                        ]}
                        data={viagens}
                        searchable
                        searchPlaceholder="Pesquisar minhas viagens..."
                        searchFields={[
                            "carga_codigo",
                            "origem",
                            "destino",
                            "status",
                            "veiculo",
                        ]}
                        emptyMessage="Nenhuma viagem vinculada a este motorista."
                        renderRow={(viagem) => (
                            <>
                                <td>{viagem.carga_codigo || "-"}</td>
                                <td>{viagem.origem}</td>
                                <td>{viagem.destino}</td>
                                <td>{viagem.status}</td>
                                <td>{viagem.veiculo || "-"}</td>
                                <td>{viagem.data_saida || "-"}</td>
                                <td>{viagem.previsao_entrega || "-"}</td>

                                <td>
                                    <Link
                                        to={`/portal/motorista/minhas-viagens/${viagem.id}`}
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

export default PainelMotorista;
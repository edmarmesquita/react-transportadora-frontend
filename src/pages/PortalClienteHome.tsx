import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";

import { listarMinhasCargas } from "../services/clienteService";
import type { MinhaCarga } from "../types/minhaCarga";

function PortalClienteHome() {
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
                setErro(
                    "Não foi possível carregar suas informações."
                );
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
        (carga) =>
            carga.status === "Entregue"
    ).length;

    const ultimaCarga = cargas[0];

    return (
        <AdminLayout>
            <div className="admin-page portal-page portal-cliente-page">

                <AdminHeader
                    title="Portal do Cliente"
                    subtitle="Acompanhe suas operações e entregas."
                />

                {carregando && (
                    <p>Carregando informações...</p>
                )}

                {!carregando && erro && (
                    <p className="mensagem-erro">
                        {erro}
                    </p>
                )}

                {!carregando && !erro && (
                    <section className="cliente-resumo">

                        <div className="cliente-boas-vindas">
                            <span>Área do Cliente</span>

                            <h2>
                                Bem-vindo ao seu espaço
                            </h2>

                            <p>
                                Acompanhe suas cargas,
                                movimentações e entregas
                                em um só lugar.
                            </p>
                        </div>

                        <div className="cliente-resumo-grid">

                            <div className="cliente-resumo-card">
                                <span className="cliente-resumo-icone">
                                    📦
                                </span>

                                <div>
                                    <strong>
                                        {cargasEmAndamento}
                                    </strong>

                                    <p>Em andamento</p>
                                </div>
                            </div>

                            <div className="cliente-resumo-card">
                                <span className="cliente-resumo-icone">
                                    🚚
                                </span>

                                <div>
                                    <strong>
                                        {cargasEmTransito}
                                    </strong>

                                    <p>Em trânsito</p>
                                </div>
                            </div>

                            <div className="cliente-resumo-card">
                                <span className="cliente-resumo-icone">
                                    ✅
                                </span>

                                <div>
                                    <strong>
                                        {cargasEntregues}
                                    </strong>

                                    <p>Entregues</p>
                                </div>
                            </div>

                            <div className="cliente-resumo-card">
                                <span className="cliente-resumo-icone">
                                    📋
                                </span>

                                <div>
                                    <strong>
                                        {cargas.length}
                                    </strong>

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

                                    <h3>
                                        {ultimaCarga.codigo}
                                    </h3>
                                </div>

                                <div className="cliente-ultima-info">
                                    <p>
                                        <strong>Status:</strong>{" "}
                                        {ultimaCarga.status}
                                    </p>

                                    <p>
                                        <strong>
                                            Local atual:
                                        </strong>{" "}
                                        {ultimaCarga.local_atual ||
                                            "Não informado"}
                                    </p>

                                    <p>
                                        <strong>Destino:</strong>{" "}
                                        {ultimaCarga.destino}
                                    </p>

                                    <p>
                                        <strong>
                                            Atualizado em:
                                        </strong>{" "}
                                        {ultimaCarga.ultima_atualizacao ||
                                            "-"}
                                    </p>
                                </div>

                                <Link
                                    to="/portal/cliente/minhas-cargas"
                                    className="btn-primary"
                                >
                                    Minhas Cargas
                                </Link>

                            </div>
                        ) : (
                            <div className="cliente-sem-cargas">
                                <h3>
                                    Nenhuma carga vinculada
                                </h3>

                                <p>
                                    Assim que uma carga for
                                    vinculada ao seu cadastro,
                                    ela aparecerá automaticamente
                                    neste portal.
                                </p>
                            </div>
                        )}

                    </section>
                )}

            </div>
        </AdminLayout>
    );
}

export default PortalClienteHome;

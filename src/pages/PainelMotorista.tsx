import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import AdminHeader from "../components/layout/AdminHeader";
import ViagemMotoristaCard from "../components/motorista/ViagemMotoristaCard";
import { listarMinhasViagens } from "../services/motoristaService";
import type { MinhaViagem } from "../types/minhaViagem";

const estadosTerminais = new Set(["Entregue", "Finalizada", "Cancelada"]);

function PainelMotorista() {
    const [viagens, setViagens] = useState<MinhaViagem[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarViagens() {
            try {
                const dados = await listarMinhasViagens();
                setViagens(Array.isArray(dados) ? dados : []);
            } catch (error) {
                setErro(error instanceof Error ? error.message : "Não foi possível carregar suas viagens.");
            } finally {
                setCarregando(false);
            }
        }
        void carregarViagens();
    }, []);

    const ativas = viagens.filter((viagem) => !estadosTerminais.has(viagem.status));
    const historico = viagens.filter((viagem) => estadosTerminais.has(viagem.status));

    return (
        <AdminLayout>
            <div className="admin-page portal-page portal-motorista-page portal-motorista-viagens-page">
                <AdminHeader title="Minhas Viagens" subtitle="Acompanhe suas viagens e encontre a próxima ação com facilidade." />
                {carregando && <p role="status">Carregando suas viagens...</p>}
                {!carregando && erro && <p className="mensagem-erro" role="alert">{erro}</p>}
                {!carregando && !erro && viagens.length === 0 && <p className="motorista-estado-vazio">Nenhuma viagem vinculada a este motorista.</p>}
                {!carregando && !erro && ativas.length > 0 && (
                    <section className="motorista-secao" aria-labelledby="motorista-ativas-titulo">
                        <div className="motorista-secao-cabecalho"><h2 id="motorista-ativas-titulo">Viagens em andamento</h2><span>{ativas.length}</span></div>
                        <div className="motorista-cards motorista-cards-ativas">
                            {ativas.map((viagem) => <ViagemMotoristaCard key={viagem.id} viagem={viagem} />)}
                        </div>
                    </section>
                )}
                {!carregando && !erro && historico.length > 0 && (
                    <section className="motorista-secao" aria-labelledby="motorista-historico-titulo">
                        <div className="motorista-secao-cabecalho"><h2 id="motorista-historico-titulo">Histórico de viagens</h2><span>{historico.length}</span></div>
                        <div className="motorista-cards motorista-cards-historico">
                            {historico.map((viagem) => <ViagemMotoristaCard key={viagem.id} viagem={viagem} historico />)}
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
}

export default PainelMotorista;

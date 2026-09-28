import { useEffect, useState, type FormEvent } from "react";

import AdminLayout from "../components/admin/AdminLayout";
import { useNotification } from "../components/ui/NotificationProvider";
import { apiFetch } from "../services/api";

type Dados = {
    nome_exibicao: string | null;
    razao_social: string | null;
    cnpj: string | null;
    telefone: string | null;
    whatsapp: string | null;
    email: string | null;
    endereco: string | null;
    logo: string | null;
};

const campos: Array<{ chave: keyof Omit<Dados, "logo">; rotulo: string; limite: number }> = [
    { chave: "nome_exibicao", rotulo: "Nome de exibição", limite: 120 },
    { chave: "razao_social", rotulo: "Razão social", limite: 150 },
    { chave: "cnpj", rotulo: "CNPJ", limite: 18 },
    { chave: "telefone", rotulo: "Telefone", limite: 30 },
    { chave: "whatsapp", rotulo: "WhatsApp", limite: 30 },
    { chave: "email", rotulo: "E-mail", limite: 120 },
    { chave: "endereco", rotulo: "Endereço", limite: 200 },
];

function DadosTransportadora() {
    const { notificar } = useNotification();
    const [dados, setDados] = useState<Dados | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let ativo = true;
        async function carregar() {
            try {
                const resposta = await apiFetch("/api/configuracao/transportadora");
                const corpo = await resposta.json().catch(() => null);
                if (!resposta.ok) throw new Error(corpo?.erro || "Não foi possível carregar os dados.");
                if (ativo) setDados(corpo as Dados);
            } catch (erro) {
                if (ativo) notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }
        void carregar();
        return () => { ativo = false; };
    }, [notificar]);

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!dados || salvando) return;
        setSalvando(true);
        try {
            const payload = Object.fromEntries(
                campos.map(({ chave }) => [chave, dados[chave] || ""])
            );
            const resposta = await apiFetch("/api/configuracao/transportadora", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const corpo = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(corpo?.erro || "Não foi possível salvar os dados.");
            setDados(corpo as Dados);
            notificar("sucesso", "Dados da transportadora atualizados.");
        } catch (erro) {
            notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <AdminLayout>
            <div className="admin-page">
                <div className="page-header">
                    <div>
                        <h1>Dados da Transportadora</h1>
                        <p>Identidade da transportadora que opera esta instalação.</p>
                    </div>
                </div>
                {carregando ? <p>Carregando dados...</p> : dados && (
                    <form className="admin-form admin-form-card admin-form-grid" onSubmit={salvar}>
                        {campos.map(({ chave, rotulo, limite }) => (
                            <div className="linha-input" key={chave}>
                                <label htmlFor={`transportadora-${chave}`}>{rotulo}</label>
                                <input
                                    id={`transportadora-${chave}`}
                                    type={chave === "email" ? "email" : "text"}
                                    value={dados[chave] || ""}
                                    maxLength={limite}
                                    required={chave === "nome_exibicao" || chave === "razao_social"}
                                    onChange={(evento) => setDados((atual) => atual && ({
                                        ...atual,
                                        [chave]: evento.target.value,
                                    }))}
                                />
                            </div>
                        ))}
                        <div className="linha-input">
                            <label>Logo</label>
                            <p>Upload de logo ainda não disponível. O campo está preparado para uma etapa futura.</p>
                        </div>
                        <button className="btn-nova-carga" type="submit" disabled={salvando}>
                            {salvando ? "Salvando..." : "Salvar dados"}
                        </button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}

export default DadosTransportadora;

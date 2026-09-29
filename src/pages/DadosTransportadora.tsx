import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

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

const ROTA_LOGO = "/api/configuracao/transportadora/logo";
const LIMITE_LOGO = 5 * 1024 * 1024;
const TIPOS_LOGO: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
};

function DadosTransportadora() {
    const { notificar } = useNotification();
    const [dados, setDados] = useState<Dados | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [urlPreview, setUrlPreview] = useState<string | null>(null);
    const [carregandoLogo, setCarregandoLogo] = useState(false);
    const [enviandoLogo, setEnviandoLogo] = useState(false);
    const [removendoLogo, setRemovendoLogo] = useState(false);
    const inputLogo = useRef<HTMLInputElement>(null);
    const versaoLogo = useRef(0);
    const processandoLogo = useRef(false);
    const montado = useRef(true);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
            versaoLogo.current += 1;
        };
    }, []);

    useEffect(() => () => {
        if (urlPreview) URL.revokeObjectURL(urlPreview);
    }, [urlPreview]);

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

    useEffect(() => {
        if (!dados?.logo) {
            setUrlPreview(null);
            setCarregandoLogo(false);
            return;
        }

        let ativo = true;
        const versao = ++versaoLogo.current;
        setCarregandoLogo(true);

        async function carregarPreview() {
            try {
                const resposta = await apiFetch(ROTA_LOGO);
                if (resposta.status === 404) {
                    if (ativo && versao === versaoLogo.current) setUrlPreview(null);
                    return;
                }
                if (!resposta.ok) {
                    const corpo = await resposta.json().catch(() => null);
                    throw new Error(corpo?.erro || "Não foi possível carregar o logotipo.");
                }
                const arquivo = await resposta.blob();
                if (ativo && versao === versaoLogo.current) {
                    setUrlPreview(URL.createObjectURL(arquivo));
                }
            } catch (erro) {
                if (ativo && versao === versaoLogo.current) {
                    notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.");
                }
            } finally {
                if (ativo && versao === versaoLogo.current) setCarregandoLogo(false);
            }
        }

        void carregarPreview();
        return () => { ativo = false; };
    }, [dados?.logo, notificar]);

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!dados || salvando || processandoLogo.current) return;
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

    async function enviarLogo(arquivo: File) {
        if (processandoLogo.current || salvando) return;
        processandoLogo.current = true;
        setEnviandoLogo(true);
        try {
            const formulario = new FormData();
            formulario.append("arquivo", arquivo);
            const resposta = await apiFetch(ROTA_LOGO, {
                method: "POST",
                body: formulario,
            });
            const corpo = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(corpo?.erro || "Não foi possível enviar o logotipo.");
            if (typeof corpo?.logo !== "string" || !corpo.logo) {
                throw new Error("Resposta inválida ao enviar o logotipo.");
            }
            if (!montado.current) return;
            versaoLogo.current += 1;
            setDados((atual) => atual && ({ ...atual, logo: corpo.logo }));
            setUrlPreview(URL.createObjectURL(arquivo));
            notificar("sucesso", "Logotipo enviado com sucesso.");
        } catch (erro) {
            if (montado.current) {
                notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.");
            }
        } finally {
            processandoLogo.current = false;
            if (montado.current) setEnviandoLogo(false);
        }
    }

    function selecionarLogo(evento: ChangeEvent<HTMLInputElement>) {
        const arquivo = evento.target.files?.[0];
        evento.target.value = "";
        if (!arquivo || processandoLogo.current || salvando) return;

        const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "";
        const tipoEsperado = TIPOS_LOGO[extensao];
        if (!tipoEsperado || (arquivo.type && arquivo.type !== tipoEsperado)) {
            notificar("erro", "Selecione uma imagem PNG ou JPEG.");
            return;
        }
        if (arquivo.size === 0) {
            notificar("erro", "O arquivo está vazio.");
            return;
        }
        if (arquivo.size > LIMITE_LOGO) {
            notificar("erro", "O logotipo deve ter no máximo 5 MB.");
            return;
        }
        void enviarLogo(arquivo);
    }

    async function removerLogo() {
        if (processandoLogo.current || salvando) return;
        processandoLogo.current = true;
        setRemovendoLogo(true);
        try {
            const resposta = await apiFetch(ROTA_LOGO, { method: "DELETE" });
            const corpo = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(corpo?.erro || "Não foi possível remover o logotipo.");
            if (!montado.current) return;
            versaoLogo.current += 1;
            setDados((atual) => atual && ({ ...atual, logo: null }));
            setUrlPreview(null);
            notificar("sucesso", "Logotipo removido com sucesso.");
        } catch (erro) {
            if (montado.current) {
                notificar("erro", erro instanceof Error ? erro.message : "Erro de conexão.");
            }
        } finally {
            processandoLogo.current = false;
            if (montado.current) setRemovendoLogo(false);
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
                        <section className="transportadora-logo-secao" aria-labelledby="transportadora-logo-titulo">
                            <h2 id="transportadora-logo-titulo">Logotipo da Transportadora</h2>
                            <p className="transportadora-logo-ajuda">PNG ou JPEG, máximo 5 MB.</p>
                            {urlPreview ? (
                                <div className="transportadora-logo-preview">
                                    <img src={urlPreview} alt="Logotipo da transportadora" />
                                </div>
                            ) : carregandoLogo ? (
                                <p>Carregando logotipo...</p>
                            ) : (
                                <p className="transportadora-logo-vazio">Nenhum logotipo cadastrado.</p>
                            )}
                            <input
                                ref={inputLogo}
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                aria-label="Arquivo do logotipo"
                                onChange={selecionarLogo}
                                hidden
                            />
                            <div className="transportadora-logo-acoes">
                                <button
                                    type="button"
                                    className="btn-nova-carga"
                                    disabled={salvando || enviandoLogo || removendoLogo}
                                    onClick={() => inputLogo.current?.click()}
                                >
                                    {enviandoLogo ? "Enviando logotipo..." : urlPreview ? "Alterar logotipo" : "Selecionar logotipo"}
                                </button>
                                {urlPreview && (
                                    <button
                                        type="button"
                                        className="btn-secundario"
                                        disabled={salvando || enviandoLogo || removendoLogo}
                                        onClick={() => { void removerLogo(); }}
                                    >
                                        {removendoLogo ? "Removendo logotipo..." : "Remover logotipo"}
                                    </button>
                                )}
                            </div>
                        </section>
                        <button className="btn-nova-carga" type="submit" disabled={salvando || enviandoLogo || removendoLogo}>
                            {salvando ? "Salvando..." : "Salvar dados"}
                        </button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}

export default DadosTransportadora;

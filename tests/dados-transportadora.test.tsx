import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { NotificationProvider } from "../src/components/ui/NotificationProvider";
import { apiFetch } from "../src/services/api";
import DadosTransportadora from "../src/pages/DadosTransportadora";

vi.mock("../src/services/api", () => ({ apiFetch: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

const api = vi.mocked(apiFetch);
const rotaDados = "/api/configuracao/transportadora";
const rotaLogo = `${rotaDados}/logo`;
const dadosBase = { nome_exibicao: "Operadora", razao_social: "Operadora Ltda", logo: null };

function montar() {
    return render(
        <NotificationProvider>
            <MemoryRouter><DadosTransportadora /></MemoryRouter>
        </NotificationProvider>
    );
}

beforeEach(() => {
    let numeroUrl = 0;
    const URLOriginal = URL;
    vi.stubGlobal("URL", class extends URLOriginal {
        static createObjectURL = vi.fn(() => `blob:logo-${++numeroUrl}`);
        static revokeObjectURL = vi.fn();
    });
    vi.spyOn(window, "alert").mockImplementation(() => { throw new Error("alert inesperado"); });
    vi.spyOn(window, "confirm").mockImplementation(() => { throw new Error("confirm inesperado"); });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
});

describe("Dados da Transportadora", () => {
    it("carrega dados existentes e salva pelo endpoint próprio sem enviar logo", async () => {
        api.mockImplementation(async (_rota, opcoes) => new Response(JSON.stringify(
            opcoes?.method === "PUT"
                ? { nome_exibicao: "Nova Operadora", razao_social: "Operadora Ltda", logo: null }
                : { nome_exibicao: "Operadora", razao_social: "Operadora Ltda", logo: null }
        ), { status: 200 }));

        montar();

        const nome = await screen.findByLabelText("Nome de exibição") as HTMLInputElement;
        expect(nome.value).toBe("Operadora");
        fireEvent.change(nome, { target: { value: "Nova Operadora" } });
        fireEvent.click(screen.getByRole("button", { name: "Salvar dados" }));

        await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
        const [rota, opcoes] = api.mock.calls[1];
        expect(rota).toBe("/api/configuracao/transportadora");
        expect(opcoes?.method).toBe("PUT");
        const enviado = JSON.parse(String(opcoes?.body));
        expect(enviado.nome_exibicao).toBe("Nova Operadora");
        expect(enviado).not.toHaveProperty("logo");
        expect(await screen.findByText("Dados da transportadora atualizados.")).toBeTruthy();
    });

    it("mostra estado vazio quando não há logo, sem buscar imagem", async () => {
        api.mockResolvedValue(new Response(JSON.stringify(dadosBase), { status: 200 }));
        montar();

        expect(await screen.findByText("Nenhum logotipo cadastrado.")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Selecionar logotipo" })).toBeTruthy();
        expect(screen.getByText("PNG ou JPEG, máximo 5 MB.")).toBeTruthy();
        expect(api).toHaveBeenCalledTimes(1);
        expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("busca imagem protegida, mostra preview e revoga URL ao desmontar", async () => {
        api.mockImplementation(async (rota) => rota === rotaLogo
            ? new Response(new Blob(["imagem"], { type: "image/png" }), { status: 200 })
            : new Response(JSON.stringify({ ...dadosBase, logo: "referencia.png" }), { status: 200 }));
        const tela = montar();

        const imagem = await screen.findByAltText("Logotipo da transportadora") as HTMLImageElement;
        expect(imagem.src).toContain("blob:logo-1");
        expect(api).toHaveBeenCalledWith(rotaLogo);
        tela.unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:logo-1");
    });

    it("trata 404 da imagem como ausência normal", async () => {
        api.mockImplementation(async (rota) => rota === rotaLogo
            ? new Response(JSON.stringify({ erro: "Logo não encontrado." }), { status: 404 })
            : new Response(JSON.stringify({ ...dadosBase, logo: "referencia.png" }), { status: 200 }));
        montar();

        expect(await screen.findByText("Nenhum logotipo cadastrado.")).toBeTruthy();
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("envia FormData autenticado sem Content-Type manual e atualiza preview sem reload", async () => {
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "POST") {
                return new Response(JSON.stringify({ logo: "novo.png" }), { status: 201 });
            }
            if (rota === rotaLogo) return new Response(new Blob(["imagem"]), { status: 200 });
            return new Response(JSON.stringify(dadosBase), { status: 200 });
        });
        montar();
        await screen.findByText("Nenhum logotipo cadastrado.");
        const arquivo = new File(["imagem"], "logo.png", { type: "image/png" });
        fireEvent.change(screen.getByLabelText("Arquivo do logotipo"), { target: { files: [arquivo] } });

        expect(await screen.findByText("Logotipo enviado com sucesso.")).toBeTruthy();
        expect(screen.getByAltText("Logotipo da transportadora")).toBeTruthy();
        const chamada = api.mock.calls.find(([rota, opcoes]) => rota === rotaLogo && opcoes?.method === "POST");
        expect(chamada).toBeTruthy();
        expect(chamada?.[1]?.body).toBeInstanceOf(FormData);
        expect((chamada?.[1]?.body as FormData).get("arquivo")).toBe(arquivo);
        expect(chamada?.[1]?.headers).toBeUndefined();
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("rejeita tipo ou tamanho inválido antes do upload e mostra toast", async () => {
        api.mockResolvedValue(new Response(JSON.stringify(dadosBase), { status: 200 }));
        montar();
        await screen.findByText("Nenhum logotipo cadastrado.");
        const seletor = screen.getByLabelText("Arquivo do logotipo");

        fireEvent.change(seletor, { target: { files: [new File(["x"], "logo.gif", { type: "image/gif" })] } });
        expect(await screen.findByText("Selecione uma imagem PNG ou JPEG.")).toBeTruthy();
        fireEvent.change(seletor, { target: { files: [new File(["x"], "falso.png", { type: "text/plain" })] } });
        expect(screen.getAllByText("Selecione uma imagem PNG ou JPEG.")).toHaveLength(2);
        fireEvent.change(seletor, { target: { files: [new File(["x".repeat(5 * 1024 * 1024 + 1)], "grande.jpg", { type: "image/jpeg" })] } });
        expect(await screen.findByText("O logotipo deve ter no máximo 5 MB.")).toBeTruthy();
        expect(api).toHaveBeenCalledTimes(1);
    });

    it("substitui o logo, revoga a URL anterior e remove sem modal", async () => {
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "POST") {
                return new Response(JSON.stringify({ logo: "novo.jpg" }), { status: 201 });
            }
            if (rota === rotaLogo && opcoes?.method === "DELETE") {
                return new Response(JSON.stringify({ logo: null }), { status: 200 });
            }
            if (rota === rotaLogo) return new Response(new Blob(["imagem"]), { status: 200 });
            return new Response(JSON.stringify({ ...dadosBase, logo: "antigo.png" }), { status: 200 });
        });
        montar();
        await screen.findByAltText("Logotipo da transportadora");
        fireEvent.change(screen.getByLabelText("Arquivo do logotipo"), {
            target: { files: [new File(["nova"], "novo.jpg", { type: "image/jpeg" })] },
        });
        expect(await screen.findByText("Logotipo enviado com sucesso.")).toBeTruthy();
        await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:logo-1"));
        fireEvent.click(screen.getByRole("button", { name: "Remover logotipo" }));
        expect(await screen.findByText("Logotipo removido com sucesso.")).toBeTruthy();
        expect(await screen.findByText("Nenhum logotipo cadastrado.")).toBeTruthy();
        await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3));
        expect(window.alert).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();
    });

    it("mantém logo atual e mostra erro de upload", async () => {
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "POST") {
                return new Response(JSON.stringify({ erro: "Imagem recusada." }), { status: 400 });
            }
            if (rota === rotaLogo) return new Response(new Blob(["imagem"]), { status: 200 });
            return new Response(JSON.stringify({ ...dadosBase, logo: "antigo.png" }), { status: 200 });
        });
        montar();
        await screen.findByAltText("Logotipo da transportadora");
        fireEvent.change(screen.getByLabelText("Arquivo do logotipo"), {
            target: { files: [new File(["nova"], "novo.png", { type: "image/png" })] },
        });
        expect((await screen.findByRole("alert")).textContent).toContain("Imagem recusada.");
        expect(screen.getByAltText("Logotipo da transportadora")).toBeTruthy();
    });

    it("mantém logo atual e mostra erro de remoção", async () => {
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "DELETE") {
                return new Response(JSON.stringify({ erro: "Não foi possível remover." }), { status: 500 });
            }
            if (rota === rotaLogo) return new Response(new Blob(["imagem"]), { status: 200 });
            return new Response(JSON.stringify({ ...dadosBase, logo: "antigo.png" }), { status: 200 });
        });
        montar();
        await screen.findByAltText("Logotipo da transportadora");
        fireEvent.click(screen.getByRole("button", { name: "Remover logotipo" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Não foi possível remover.");
        expect(screen.getByAltText("Logotipo da transportadora")).toBeTruthy();
    });

    it("impede envio duplicado enquanto a requisição está pendente", async () => {
        let concluirUpload!: (resposta: Response) => void;
        const uploadPendente = new Promise<Response>((resolver) => { concluirUpload = resolver; });
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "POST") return uploadPendente;
            if (rota === rotaLogo) return new Response(new Blob(["imagem"]), { status: 200 });
            return new Response(JSON.stringify(dadosBase), { status: 200 });
        });
        montar();
        await screen.findByText("Nenhum logotipo cadastrado.");
        const seletor = screen.getByLabelText("Arquivo do logotipo");
        const arquivo = new File(["imagem"], "logo.png", { type: "image/png" });
        fireEvent.change(seletor, { target: { files: [arquivo] } });
        fireEvent.change(seletor, { target: { files: [arquivo] } });

        expect(screen.getByRole("button", { name: "Enviando logotipo..." }).hasAttribute("disabled")).toBe(true);
        expect(api.mock.calls.filter(([rota, opcoes]) => rota === rotaLogo && opcoes?.method === "POST")).toHaveLength(1);
        concluirUpload(new Response(JSON.stringify({ logo: "novo.png" }), { status: 201 }));
        expect(await screen.findByText("Logotipo enviado com sucesso.")).toBeTruthy();
    });

    it("ignora GET antigo após upload e mostra erro de rede em remoção", async () => {
        let concluirLeitura!: (resposta: Response) => void;
        const leituraPendente = new Promise<Response>((resolver) => { concluirLeitura = resolver; });
        api.mockImplementation(async (rota, opcoes) => {
            if (rota === rotaLogo && opcoes?.method === "POST") {
                return new Response(JSON.stringify({ logo: "novo.png" }), { status: 201 });
            }
            if (rota === rotaLogo && opcoes?.method === "DELETE") throw new Error("Rede indisponível.");
            if (rota === rotaLogo && api.mock.calls.filter(([caminho]) => caminho === rotaLogo).length === 1) {
                return leituraPendente;
            }
            if (rota === rotaLogo) return new Response(new Blob(["nova"]), { status: 200 });
            return new Response(JSON.stringify({ ...dadosBase, logo: "antigo.png" }), { status: 200 });
        });
        montar();
        await screen.findByText("Carregando logotipo...");
        fireEvent.change(screen.getByLabelText("Arquivo do logotipo"), {
            target: { files: [new File(["nova"], "novo.png", { type: "image/png" })] },
        });
        expect(await screen.findByText("Logotipo enviado com sucesso.")).toBeTruthy();
        concluirLeitura(new Response(new Blob(["antiga"]), { status: 200 }));
        await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(2));
        expect((screen.getByAltText("Logotipo da transportadora") as HTMLImageElement).src).toContain("blob:logo-2");
        fireEvent.click(screen.getByRole("button", { name: "Remover logotipo" }));
        expect((await screen.findByRole("alert")).textContent).toContain("Rede indisponível.");
        expect(screen.getByAltText("Logotipo da transportadora")).toBeTruthy();
    });
});

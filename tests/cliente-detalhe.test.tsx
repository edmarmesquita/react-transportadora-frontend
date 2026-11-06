// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalheCargaCliente from "../src/pages/DetalheCargaCliente";
import { buscarDetalheCarga, criarOcorrenciaCarga, listarComprovantesCarga, listarOcorrenciasCarga } from "../src/services/clienteService";
import { abrirArquivoAutenticado } from "../src/services/arquivosService";
import type { DetalheMinhaCarga } from "../src/types/minhaCarga";

vi.mock("../src/services/clienteService", () => ({ buscarDetalheCarga: vi.fn(), criarOcorrenciaCarga: vi.fn(), listarOcorrenciasCarga: vi.fn(), listarComprovantesCarga: vi.fn() }));
vi.mock("../src/services/arquivosService", () => ({ abrirArquivoAutenticado: vi.fn() }));
vi.mock("../src/components/admin/AdminLayout", () => ({ default: ({ children }: { children: ReactNode }) => <main>{children}</main> }));

const detalhe = vi.mocked(buscarDetalheCarga);
const ocorrencias = vi.mocked(listarOcorrenciasCarga);
const comprovantes = vi.mocked(listarComprovantesCarga);
const criar = vi.mocked(criarOcorrenciaCarga);
const abrir = vi.mocked(abrirArquivoAutenticado);
const base: DetalheMinhaCarga = {
    id: 5, codigo: "TRK-5", cliente: "Cliente", status: "Em trânsito",
    origem: "São Paulo/SP", destino: "São José dos Campos/SP", local_atual: "Jacareí/SP",
    previsao_entrega: "05/11/2026 17:30", ultima_atualizacao: "05/11/2026 15:53",
    historico: [{ id: 1, status: "Em coleta", local: "São Paulo/SP", observacao: "Observação original", data_evento: "05/11/2026 09:00" }],
};

function montar(carga: DetalheMinhaCarga | null = base) {
    if (carga) detalhe.mockResolvedValue(carga);
    return render(<MemoryRouter initialEntries={["/portal/cliente/minhas-cargas/5"]}>
        <Routes><Route path="/portal/cliente/minhas-cargas/:id" element={<DetalheCargaCliente />} /></Routes>
    </MemoryRouter>);
}

beforeEach(() => {
    ocorrencias.mockResolvedValue([]);
    comprovantes.mockResolvedValue({ comprovantes: [], arquivos: [] });
    criar.mockResolvedValue({ id: 10, titulo: "Atraso na entrega", descricao: "Descrição teste", data_ocorrencia: "05/11/2026" });
    abrir.mockResolvedValue();
});
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("Detalhe do Cliente 2.0", () => {
    it("mostra status, rota, previsão, localização informada e atualização", async () => {
        montar();
        const painel = await screen.findByRole("region", { name: "TRK-5" });
        expect(within(painel).getByText("Em trânsito")).toBeTruthy();
        for (const valor of ["São Paulo/SP", "São José dos Campos/SP", "Jacareí/SP", "05/11/2026 17:30", "05/11/2026 15:53"]) {
            expect(within(painel).getByText(valor)).toBeTruthy();
        }
        expect(detalhe).toHaveBeenCalledWith(5);
    });

    it("apresenta 4600 kg como 4.600 kg sem converter a unidade", async () => {
        montar({ ...base, peso_kg: 4600 });
        expect(await screen.findByText("4.600 kg")).toBeTruthy();
        expect(screen.queryByText("4.6 kg")).toBeNull();
    });

    it("marca Saiu para entrega como etapa atual", async () => {
        montar({ ...base, status: "Saiu para entrega" });
        const progresso = await screen.findByRole("region", { name: "Progresso da entrega" });
        expect(within(progresso).getByText("Saiu para entrega").closest(".cliente-progresso-etapa")?.className).toContain("atual");
    });

    it("mostra Entregue como terminal e sem linguagem de carga a caminho", async () => {
        montar({ ...base, status: "Entregue" });
        const progresso = await screen.findByRole("region", { name: "Progresso da entrega" });
        expect(within(progresso).getByText("Entregue").closest(".cliente-progresso-etapa")?.className).toContain("atual");
        expect(screen.queryByText("Sua carga está a caminho")).toBeNull();
    });

    it.each(["Cancelada", "Finalizada", "Estado futuro"])("mostra %s sem inventar etapa", async (status) => {
        montar({ ...base, status });
        expect(await screen.findByText(status, { selector: ".cliente-detalhe-status" })).toBeTruthy();
        expect(screen.queryByRole("region", { name: "Progresso da entrega" })).toBeNull();
    });

    it("trata origem, destino e datas ausentes sem usar localização como origem", async () => {
        montar({ ...base, origem: "", destino: "", local_atual: "Jacareí/SP", previsao_entrega: "", ultima_atualizacao: "" });
        const painel = await screen.findByRole("region", { name: "TRK-5" });
        expect(within(painel).getByText("Origem não informada")).toBeTruthy();
        expect(within(painel).getByText("Destino não informado")).toBeTruthy();
        expect(within(painel).getAllByText("Não informada")).toHaveLength(2);
        expect(document.body.textContent).not.toMatch(/undefined|null|Invalid Date/);
    });

    it("preserva todos os eventos da Timeline com texto e ordem recebidos", async () => {
        montar({ ...base, historico: [
            ...base.historico,
            { id: 2, status: "Em trânsito", local: "Jacareí/SP", observacao: "Segundo evento", data_evento: "05/11/2026 15:53" },
        ] });
        expect(await screen.findByText("Observação original")).toBeTruthy();
        expect(screen.getByText("Segundo evento")).toBeTruthy();
        expect(document.querySelectorAll(".timeline-evento")).toHaveLength(2);
    });

    it("lista ocorrências e preserva o envio atual", async () => {
        ocorrencias.mockResolvedValue([{ id: 7, titulo: "Dúvida", descricao: "Preciso de ajuda", data_ocorrencia: "05/11/2026" }]);
        montar();
        expect(await screen.findByText("Preciso de ajuda")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Tipo ou título da ocorrência"), { target: { value: "Atraso na entrega" } });
        fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "  Descrição teste  " } });
        fireEvent.click(screen.getByRole("button", { name: "Registrar Ocorrência" }));
        await waitFor(() => expect(criar).toHaveBeenCalledWith(5, { titulo: "Atraso na entrega", descricao: "Descrição teste" }));
        expect(await screen.findByText("Ocorrência registrada com sucesso!")).toBeTruthy();
    });

    it("mostra comprovante e abre arquivo pelo serviço autenticado", async () => {
        comprovantes.mockResolvedValue({
            comprovantes: [{ id: 2, viagem_id: 3, recebedor: "Ana", observacao: "Recebido", data_entrega: "05/11/2026" }],
            arquivos: [{ id: 4, nome_arquivo: "comprovante.pdf", data_upload: "05/11/2026", download_endpoint: "/api/arquivo/4" }],
        });
        montar();
        expect(await screen.findByText("Ana")).toBeTruthy();
        expect(screen.getByText("Recebido")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Abrir comprovante.pdf" }));
        expect(abrir).toHaveBeenCalledWith("/api/arquivo/4");
    });

    it("mostra ausência de comprovante sem confundir com erro", async () => {
        montar();
        expect(await screen.findByText("Nenhum comprovante disponível até o momento.")).toBeTruthy();
    });

    it("mostra erro do detalhe", async () => {
        detalhe.mockRejectedValue(new Error("Detalhe indisponível"));
        montar(null);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Detalhe indisponível");
        expect(screen.queryByRole("region", { name: "TRK-5" })).toBeNull();
    });

    it.each(["ocorrencias", "comprovantes"])("mantém painel visível se %s falhar", async (tipo) => {
        if (tipo === "ocorrencias") ocorrencias.mockRejectedValue(new Error("Falha nas ocorrências"));
        else comprovantes.mockRejectedValue(new Error("Falha nos comprovantes"));
        montar();
        expect(await screen.findByRole("region", { name: "TRK-5" })).toBeTruthy();
        expect(screen.getByRole("alert").textContent).toContain(tipo === "ocorrencias" ? "Falha nas ocorrências" : "Falha nos comprovantes");
        if (tipo === "comprovantes") expect(screen.queryByText("Nenhum comprovante disponível até o momento.")).toBeNull();
    });

    it("volta para Minhas Cargas", () => {
        montar();
        expect(screen.getByRole("link", { name: "Voltar para Minhas Cargas" }).getAttribute("href")).toBe("/portal/cliente/minhas-cargas");
    });
});

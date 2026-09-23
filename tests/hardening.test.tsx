import { afterEach, describe, expect, it, vi } from "vitest";

const API_STAGING =
    "https://backend-transportadora-staging-staging.up.railway.app";
const API_PRODUCAO =
    "https://rotanza-backend-production-production.up.railway.app";

type VercelHeader = {
    key: string;
    value: string;
};

type VercelConfig = {
    headers?: Array<{
        source: string;
        headers: VercelHeader[];
    }>;
    rewrites?: Array<{
        source: string;
        destination: string;
    }>;
};

async function carregarConfiguracaoVercel(
    origemApi?: string,
): Promise<VercelConfig> {
    vi.resetModules();

    if (origemApi === undefined) {
        delete process.env.VITE_API_URL;
    } else {
        process.env.VITE_API_URL = origemApi;
    }

    const modulo = await import("../vercel");
    return modulo.config;
}

function obterHeadersGlobais(configuracao: VercelConfig) {
    const regra = configuracao.headers?.find(
        (item) => item.source === "/(.*)",
    );

    expect(regra).toBeDefined();
    return new Map(
        regra?.headers.map((header) => [header.key, header.value]),
    );
}

afterEach(() => {
    delete process.env.VITE_API_URL;
    vi.resetModules();
});

describe("hardening do frontend Vercel", () => {
    it.each([
        ["staging", API_STAGING, API_PRODUCAO],
        ["produção", API_PRODUCAO, API_STAGING],
    ])(
        "gera CSP isolada para %s",
        async (_ambiente, origemEsperada, origemProibida) => {
            const configuracao = await carregarConfiguracaoVercel(
                origemEsperada,
            );
            const headers = obterHeadersGlobais(configuracao);
            const csp = headers.get("Content-Security-Policy") ?? "";
            const cspEsperada = [
                "default-src 'self';",
                "base-uri 'self';",
                "object-src 'none';",
                "frame-ancestors 'self';",
                "form-action 'self';",
                "script-src 'self';",
                "style-src 'self' 'unsafe-inline';",
                "img-src 'self' data: blob:;",
                "font-src 'self' data:;",
                `connect-src 'self' ${origemEsperada};`,
                "frame-src https://www.google.com;",
            ].join(" ");

            expect(csp).toBe(cspEsperada);
            expect(csp).not.toContain(origemProibida);
            expect(csp).toContain("frame-src https://www.google.com;");
            expect(csp).toContain("img-src 'self' data: blob:;");
            expect(csp).toContain(
                "style-src 'self' 'unsafe-inline';",
            );
            expect(csp).not.toContain("unsafe-eval");
            expect(csp).not.toContain("default-src *");
            expect(
                headers.has("Content-Security-Policy-Report-Only"),
            ).toBe(false);
        },
    );

    it.each([undefined, "", "https://api-nao-aprovada.example"])(
        "rejeita VITE_API_URL inválida: %s",
        async (origemApi) => {
            await expect(
                carregarConfiguracaoVercel(origemApi),
            ).rejects.toThrow(/VITE_API_URL/);
        },
    );

    it("mantém o rewrite da SPA", async () => {
        const configuracao = await carregarConfiguracaoVercel(API_STAGING);

        expect(configuracao.rewrites).toEqual([
            {
                source: "/(.*)",
                destination: "/index.html",
            },
        ]);
    });

    it("preserva os headers básicos de segurança", async () => {
        const configuracao = await carregarConfiguracaoVercel(API_STAGING);
        const headers = obterHeadersGlobais(configuracao);

        expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
        expect(headers.get("Referrer-Policy")).toBe(
            "strict-origin-when-cross-origin",
        );
        expect(headers.get("Permissions-Policy")).toBe(
            "camera=(), microphone=(), geolocation=()",
        );
    });
});

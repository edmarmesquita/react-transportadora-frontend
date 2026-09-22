import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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

function lerConfiguracaoVercel(): VercelConfig {
    return JSON.parse(
        readFileSync("vercel.json", "utf8")
    ) as VercelConfig;
}

function obterHeadersGlobais() {
    const configuracao = lerConfiguracaoVercel();
    const regra = configuracao.headers?.find(
        (item) => item.source === "/(.*)"
    );

    expect(regra).toBeDefined();
    return new Map(
        regra?.headers.map((header) => [header.key, header.value])
    );
}

describe("hardening do frontend Vercel", () => {
    it("mantém o rewrite da SPA", () => {
        const configuracao = lerConfiguracaoVercel();

        expect(configuracao.rewrites).toEqual([
            {
                source: "/(.*)",
                destination: "/index.html",
            },
        ]);
    });

    it("configura os headers básicos de segurança", () => {
        const headers = obterHeadersGlobais();

        expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
        expect(headers.get("Referrer-Policy")).toBe(
            "strict-origin-when-cross-origin"
        );
        expect(headers.get("Permissions-Policy")).toBe(
            "camera=(), microphone=(), geolocation=()"
        );
    });

    it("mantém CSP bloqueante com as origens necessárias", () => {
        const headers = obterHeadersGlobais();
        const csp = headers.get("Content-Security-Policy") ?? "";

        expect(csp).toContain("connect-src 'self' https://backend-transportadora-staging-staging.up.railway.app");
        expect(csp).toContain("frame-src https://www.google.com");
        expect(csp).toContain("img-src 'self' data: blob:");
        expect(csp).toContain("style-src 'self' 'unsafe-inline'");
        expect(csp).not.toContain("unsafe-eval");
        expect(csp).not.toContain("default-src *");
        expect(headers.has("Content-Security-Policy-Report-Only")).toBe(false);
    });
});

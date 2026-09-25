import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const raiz = process.cwd();

function lerArquivo(caminho: string) {
    return readFileSync(resolve(raiz, caminho), "utf8");
}

describe("identidade pública Rotanza", () => {
    it("remove referências visuais à marca Ramos da home e do layout", () => {
        const arquivosPublicos = [
            "src/components/home/Hero.tsx",
            "src/components/home/FleetSection.tsx",
            "src/components/layout/Header.tsx",
            "src/components/layout/Footer.tsx",
            "src/pages/Frota.tsx",
            "src/pages/Sobre.tsx",
            "src/styles/home.css",
            "src/styles/ui.css",
        ];

        for (const arquivo of arquivosPublicos) {
            expect(lerArquivo(arquivo)).not.toMatch(/ramos/i);
        }
    });

    it("mantém a identificação Rotanza no documento e no favicon", () => {
        expect(lerArquivo("index.html")).toContain("<title>ROTANZA</title>");
        expect(lerArquivo("public/favicon.svg")).toContain('aria-label="Rotanza"');
        expect(lerArquivo("src/components/layout/Header.tsx")).toContain(
            "ROTANZA",
        );
    });
});

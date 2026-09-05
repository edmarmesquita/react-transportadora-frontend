import { apiFetch } from "./api";


export async function abrirArquivoAutenticado(
    downloadEndpoint: string
): Promise<void> {
    const resposta = await apiFetch(downloadEndpoint);

    if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);

        throw new Error(
            dados?.erro ||
            dados?.msg ||
            "Não foi possível abrir o arquivo."
        );
    }

    const arquivo = await resposta.blob();
    const urlTemporaria = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = urlTemporaria;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
        URL.revokeObjectURL(urlTemporaria);
    }, 60_000);
}

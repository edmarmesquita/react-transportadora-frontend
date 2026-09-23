const API_STAGING =
  "https://backend-transportadora-staging-staging.up.railway.app";
const API_PRODUCAO =
  "https://rotanza-backend-production-production.up.railway.app";

const origensApiPermitidas = new Set([
  API_STAGING,
  API_PRODUCAO,
]);

function obterOrigemApi(): string {
  const origem = process.env.VITE_API_URL;

  if (!origem) {
    throw new Error(
      "VITE_API_URL deve ser configurada para gerar a CSP do frontend.",
    );
  }

  if (!origensApiPermitidas.has(origem)) {
    throw new Error(
      "VITE_API_URL não corresponde a uma origem aprovada para a CSP.",
    );
  }

  return origem;
}

const origemApi = obterOrigemApi();

const contentSecurityPolicy = [
  "default-src 'self';",
  "base-uri 'self';",
  "object-src 'none';",
  "frame-ancestors 'self';",
  "form-action 'self';",
  "script-src 'self';",
  "style-src 'self' 'unsafe-inline';",
  "img-src 'self' data: blob:;",
  "font-src 'self' data:;",
  `connect-src 'self' ${origemApi};`,
  "frame-src https://www.google.com;",
].join(" ");

export const config = {
  headers: [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: contentSecurityPolicy,
        },
      ],
    },
  ],
  rewrites: [
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};

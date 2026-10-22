type AppEnv = "local" | "dev" | "prod";

const currentEnv = (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) || "local";
const isCI = process.env.CI === "true";

const API_URLS: Record<AppEnv, string | undefined> = {
  local: process.env.NEXT_PUBLIC_API_URL_LOCAL,
  dev: process.env.NEXT_PUBLIC_API_URL_DEV,
  prod: process.env.NEXT_PUBLIC_API_URL_PROD,
};

function resolveApiUrl(): string | undefined {
  const url = API_URLS[currentEnv];
  if (url && url.trim().length > 0) {
    return url;
  }

  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isLocalhost && process.env.NEXT_PUBLIC_API_URL_PROD) {
      return process.env.NEXT_PUBLIC_API_URL_PROD;
    }
  }

  return isCI ? "http://localhost:8080/api" : undefined;
}

export const ENV_CONFIG = {
  env: currentEnv,
  apiUrl: resolveApiUrl(),
};

if (!ENV_CONFIG.apiUrl) {
  throw new Error(
    `Falta NEXT_PUBLIC_API_URL_${currentEnv.toUpperCase()} en tu .env.local. Revisa .env.example.`
  );
}

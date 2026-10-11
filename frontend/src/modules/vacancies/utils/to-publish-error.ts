import { isAxiosError } from "axios";
import { PUBLISH_MESSAGES } from "../constants/vacancies.constants";
import type { PublishError } from "../types/job-offer.types";

interface ValidationDetail {
  campo?: string;
  mensaje?: string;
}

function readDetails(detail: unknown): string[] {
  if (typeof detail === "string") return [detail];
  if (!Array.isArray(detail)) return [];

  return (detail as ValidationDetail[])
    .map((item) => item.mensaje)
    .filter((message): message is string => Boolean(message));
}

/** Convierte cualquier fallo de la publicación en un mensaje amigable y su tipo. */
export function toPublishError(error: unknown): PublishError {
  if (!isAxiosError(error)) {
    return { kind: "server", message: PUBLISH_MESSAGES.server, details: [] };
  }

  if (!error.response) {
    return { kind: "network", message: PUBLISH_MESSAGES.network, details: [] };
  }

  const { status, data } = error.response;
  const details = readDetails((data as { detail?: unknown } | undefined)?.detail);

  // El backend usa 422 para los campos y 400 para las reglas de habilidades (catálogo,
  // duplicadas, máximo): ambos son datos inválidos que la empresa puede corregir.
  if (status === 422 || status === 400) {
    return { kind: "validation", message: PUBLISH_MESSAGES.validation, details };
  }
  if (status === 404) {
    return { kind: "company", message: PUBLISH_MESSAGES.company, details: [] };
  }
  if (status === 401 || status === 403) {
    return { kind: "session", message: PUBLISH_MESSAGES.session, details: [] };
  }

  return { kind: "server", message: PUBLISH_MESSAGES.server, details: [] };
}

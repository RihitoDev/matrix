import { isApiError as isAxiosError } from "@/shared/services/api-client";
import { PUBLISH_MESSAGES } from "../constants/vacancies.constants";
import type { PublishError } from "../types/job-offer.types";

interface ErrorBody {
  data?: unknown;
  detail?: unknown;
}

function readValidationMessages(data: unknown): string[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => (item as { message?: unknown }).message)
    .filter((message): message is string => typeof message === "string" && message.length > 0);
}

function readDetails(body: ErrorBody | undefined): string[] {
  const messages = readValidationMessages(body?.data);
  if (messages.length > 0) return messages;
  return typeof body?.detail === "string" && body.detail.length > 0 ? [body.detail] : [];
}

export function toPublishError(error: unknown): PublishError {
  if (!isAxiosError(error)) {
    return { kind: "server", message: PUBLISH_MESSAGES.server, details: [] };
  }
  if (!error.response) {
    return { kind: "network", message: PUBLISH_MESSAGES.network, details: [] };
  }

  const { status, data } = error.response;
  if (status === 400 || status === 422) {
    return { kind: "validation", message: PUBLISH_MESSAGES.validation, details: readDetails(data as ErrorBody) };
  }
  if (status === 404) {
    return { kind: "company", message: PUBLISH_MESSAGES.company, details: [] };
  }
  if (status === 401 || status === 403) {
    return { kind: "session", message: PUBLISH_MESSAGES.session, details: [] };
  }
  return { kind: "server", message: PUBLISH_MESSAGES.server, details: [] };
}

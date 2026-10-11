import { OTHER_REJECTION_REASON, REJECTION_MAX_LENGTH } from "../constants/request-review.constants";
import type { RejectionReasonResult } from "../types/rejection-reason-result.types";

// El servidor recibe UNA cadena: el motivo elegido y, si hay indicación, ". " y la indicación.
// "Otro motivo" exige una indicación no vacía.
export function buildRejectionReason(choice: string | null, hint: string): RejectionReasonResult {
  const cleanHint = (hint ?? "").trim();
  const reason = choice ? (cleanHint ? `${choice}. ${cleanHint}` : choice) : "";
  const length = reason.length;

  if (!choice) return { reason, length, isValid: false, error: null };
  if (choice === OTHER_REJECTION_REASON && cleanHint.length === 0) {
    return { reason, length, isValid: false, error: "Escribe la indicación para el solicitante" };
  }
  if (length > REJECTION_MAX_LENGTH) {
    return { reason, length, isValid: false, error: `El motivo no puede superar los ${REJECTION_MAX_LENGTH} caracteres` };
  }
  return { reason, length, isValid: true, error: null };
}

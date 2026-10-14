import { OTHER_REJECTION_REASON, REJECTION_MAX_LENGTH, REJECTION_REASON_SEPARATOR } from "../constants/request-review.constants";
import type { RejectionReasonResult } from "../types/rejection-reason-result.types";

export function buildRejectionReason(choice: string | null, hint: string): RejectionReasonResult {
  const cleanHint = (hint ?? "").trim();
  const reason = choice ? (cleanHint ? `${choice}${REJECTION_REASON_SEPARATOR}${cleanHint}` : choice) : "";
  const reservedLength = choice ? choice.length + REJECTION_REASON_SEPARATOR.length : 0;
  const hintMaxLength = REJECTION_MAX_LENGTH - reservedLength;
  const hintLength = cleanHint.length;
  const base = { reason, hintLength, hintMaxLength, reservedLength };

  if (!choice) return { ...base, isValid: false, error: null };
  if (choice === OTHER_REJECTION_REASON && hintLength === 0) {
    return { ...base, isValid: false, error: "Escribe la indicación para el solicitante" };
  }
  if (hintLength > hintMaxLength) {
    return { ...base, isValid: false, error: `La indicación no puede superar los ${hintMaxLength} caracteres` };
  }
  return { ...base, isValid: true, error: null };
}

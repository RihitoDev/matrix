export interface RejectionReasonResult {
  reason: string;
  hintLength: number;
  hintMaxLength: number;
  reservedLength: number;
  isValid: boolean;
  error: string | null;
}

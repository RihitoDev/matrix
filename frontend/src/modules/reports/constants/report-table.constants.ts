import { OTHER_REJECTION_REASON } from "@/modules/request-review/constants/request-review.constants";
import type { RejectionReason } from "../types/rejection-reason.types";

export const TABLE_SKELETON_ROWS = 10;
export const TABLE_STATE_CONTENT_CLASSES = "sticky left-0 w-[100cqw] whitespace-normal px-6";

export const REGISTERED_USERS_COLUMN_COUNT = 6;
export const REJECTED_USERS_COLUMN_COUNT = 5;
export const REPORT_HISTORY_COLUMN_COUNT = 3;

export const USERS_TABLE_HEAD_CLASSES = "h-auto px-6 py-3 font-semibold text-ink";
export const REPORT_HISTORY_HEAD_CLASSES = "h-auto px-6 py-3 font-semibold text-text-secondary";
export const TABLE_CELL_CLASSES = "px-6 py-4 text-ink-soft";
// Primera columna fija al desplazar la tabla en horizontal (móvil)
export const STICKY_HEAD_CLASSES = "sticky left-0 z-10 bg-surface-soft";
export const STICKY_CELL_CLASSES = "sticky left-0 z-10 bg-surface group-hover:bg-surface-soft";
export const TABLE_CONTAINER_CLASSES = "@container min-h-151 rounded-lg border border-border bg-surface";

export const REJECTION_REASON_SHORT_LABELS: Record<RejectionReason, string> = {
  "Documento ilegible": "Documento ilegible",
  "El nombre no coincide con los datos declarados": "El nombre no coincide",
  "Documento incompleto o recortado": "Documento incompleto",
  "El documento no corresponde a la carrera": "No corresponde a la carrera",
  [OTHER_REJECTION_REASON]: OTHER_REJECTION_REASON,
};
export const REJECTION_BADGE_CLASSES =
  "mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-interaction bg-interaction px-2.5 py-0.5 text-xs font-semibold text-accent";

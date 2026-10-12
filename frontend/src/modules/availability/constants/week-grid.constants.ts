import type { AvailabilityBlockState } from "../types/availability-block-state.types";

export const WEEK_GRID_START_HOUR = 7;
export const WEEK_GRID_END_HOUR = 22;
export const HOUR_HEIGHT_PX = 48;
export const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"] as const;

export const STATE_BUTTON_VARIANT: Record<AvailabilityBlockState, "outline" | "default"> = {
  free: "outline",
  pending: "outline",
  confirmed: "default",
};

export const STATE_BUTTON_CLASSES: Record<AvailabilityBlockState, string> = {
  free: "",
  pending: "border-2 border-dashed border-ink",
  confirmed: "bg-ink border-ink text-white hover:bg-ink",
};

export const STATE_LABELS_ES: Record<AvailabilityBlockState, string> = {
  free: "libre",
  pending: "pendiente",
  confirmed: "confirmada",
};

export const SELECTED_BLOCK_CLASSES = "border-accent bg-accent/10 text-ink ring-2 ring-accent";

export const SELECTED_LEGEND_LABEL = "Tu selección";

export const BLOCK_STATE_TEXT: Record<AvailabilityBlockState, string> = {
  free: "Libre",
  pending: "Pendiente",
  confirmed: "Confirmada",
};

export const WEEK_GRID_LEGEND = {
  free: "Libre",
  pending: "Solicitud pendiente",
  confirmed: "Cita confirmada",
  freeSlot: "Horario libre",
} as const;

export const EMPTY_DAY_LABEL = "Sin bloques";

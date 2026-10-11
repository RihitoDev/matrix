import type { AvailabilityBlockState } from "../types/availability-block-state.types";

export const STATE_LABELS: Record<AvailabilityBlockState, string> = {
  free: "BLOQUE LIBRE",
  pending: "BLOQUE PENDIENTE",
  confirmed: "BLOQUE CONFIRMADO",
};

export const DELETE_BLOCK_ERROR = "Error al eliminar el bloque de disponibilidad";

export const DELETE_BLOCK_TEXT = {
  action: "Eliminar bloque",
  title: "¿Eliminar este bloque?",
  description:
    "Los egresados dejarán de ver este horario al buscar mentorías. Esta acción no se puede deshacer.",
  cancel: "Cancelar",
  deleting: "Eliminando...",
  confirm: "Eliminar bloque",
} as const;

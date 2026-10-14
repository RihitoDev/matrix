export type ReviewProfileStatus =
  | "Completado"
  | "Procesando"
  | "Pendiente";

export type ReviewQueueFilter = "Todos" | ReviewProfileStatus;

export type ReviewAffinityLevel =
  | "Experto"
  | "Avanzado"
  | "Intermedio"
  | "Base";

export interface ReviewAffinityArea {
  area: string;
  nivel: ReviewAffinityLevel;
  puntuacion: number;
}

export interface ReviewProfile {
  id: number;
  nombre: string;
  cargoObjetivo: string;
  fechaEnvio: string;
  afinidadGlobal: number;
  estado: ReviewProfileStatus;
  areas: ReviewAffinityArea[];
}
export type ReviewAction = "approved" | "rejected";
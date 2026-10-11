// Espeja el catálogo careers del backend (títulos del catálogo)
// TODO: reemplazar por la lista del backend si se agrega un endpoint de carreras
export const CAREERS = [
  "Licenciatura en Ingeniería de Sistemas",
  "Licenciatura Ingeniería en Informática",
] as const;

export type Career = (typeof CAREERS)[number];

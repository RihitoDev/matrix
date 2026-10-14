import type {
  ReviewProfile,
  ReviewQueueFilter,
} from "../types/review-queue.types";

export const REVIEW_PROFILES: ReviewProfile[] = [
  {
    id: 1,
    nombre: "Ana Martínez",
    cargoObjetivo: "Full Stack Developer",
    fechaEnvio: "05/10/2026 18:20",
    afinidadGlobal: 8.5,
    estado: "Completado",
    areas: [
      { area: "Desarrollo", nivel: "Experto", puntuacion: 9 },
      { area: "Cloud/DevOps", nivel: "Experto", puntuacion: 8.5 },
      { area: "Data/AI", nivel: "Experto", puntuacion: 8 },
      { area: "QA", nivel: "Experto", puntuacion: 8.5 },
      { area: "Ciberseguridad", nivel: "Experto", puntuacion: 8 },
      { area: "Gobernanza TI", nivel: "Experto", puntuacion: 9 },
    ],
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    cargoObjetivo: "DevOps Engineer",
    fechaEnvio: "05/10/2026 17:45",
    afinidadGlobal: 7.3,
    estado: "Procesando",
    areas: [
      { area: "Desarrollo", nivel: "Avanzado", puntuacion: 7 },
      { area: "Cloud/DevOps", nivel: "Experto", puntuacion: 9 },
      { area: "Data/AI", nivel: "Avanzado", puntuacion: 7 },
      { area: "QA", nivel: "Avanzado", puntuacion: 7.5 },
      { area: "Ciberseguridad", nivel: "Avanzado", puntuacion: 7 },
      { area: "Gobernanza TI", nivel: "Intermedio", puntuacion: 6.3 },
    ],
  },
  {
    id: 3,
    nombre: "María López",
    cargoObjetivo: "Data Analyst",
    fechaEnvio: "05/10/2026 16:30",
    afinidadGlobal: 6.8,
    estado: "Pendiente",
    areas: [
      { area: "Desarrollo", nivel: "Avanzado", puntuacion: 6.5 },
      { area: "Cloud/DevOps", nivel: "Intermedio", puntuacion: 6 },
      { area: "Data/AI", nivel: "Experto", puntuacion: 9 },
      { area: "QA", nivel: "Avanzado", puntuacion: 6.5 },
      { area: "Ciberseguridad", nivel: "Intermedio", puntuacion: 6 },
      { area: "Gobernanza TI", nivel: "Avanzado", puntuacion: 6.8 },
    ],
  },
  {
    id: 4,
    nombre: "Diego Fernández",
    cargoObjetivo: "QA Engineer",
    fechaEnvio: "05/10/2026 15:10",
    afinidadGlobal: 6.2,
    estado: "Pendiente",
    areas: [
      { area: "Desarrollo", nivel: "Intermedio", puntuacion: 6 },
      { area: "Cloud/DevOps", nivel: "Intermedio", puntuacion: 5.5 },
      { area: "Data/AI", nivel: "Intermedio", puntuacion: 5.5 },
      { area: "QA", nivel: "Experto", puntuacion: 9 },
      { area: "Ciberseguridad", nivel: "Intermedio", puntuacion: 5.5 },
      { area: "Gobernanza TI", nivel: "Intermedio", puntuacion: 5.7 },
    ],
  },
];

export const REVIEW_QUEUE_FILTERS: ReviewQueueFilter[] = [
  "Todos",
  "Completado",
  "Procesando",
  "Pendiente",
];
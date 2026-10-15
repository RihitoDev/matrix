import type { AreaDetail, AreaId } from "@/modules/radar-chart/types/area-detail.types";
import { AREA_DETAILS } from "@/modules/radar-chart/data/area-details.data";
import { calculateGap } from "@/modules/radar-chart/utils/calculate-gap";
import { getAreaLevel } from "@/modules/radar-chart/utils/get-area-level";
import type { Candidate } from "../types/matching-types";
import { AFFINITY_AXES } from "./matching.data";

/** Datos de demostración por persona. No representan historiales verificados. */
type Evidence = Pick<AreaDetail, "courses" | "certifications" | "experience" | "tags">;

const CANDIDATE_EVIDENCE: Record<string, Partial<Record<AreaId, Evidence>>> = {
  "cand-lucia-flores": {
    "data-ai": {
      courses: [
        { id: "lucia-data-course", name: "Machine learning con Python", institution: "Coursera", year: 2024 },
      ],
      certifications: [
        { id: "lucia-data-cert", name: "Análisis de datos con SQL", issuer: "Programa de demostración", year: 2023 },
      ],
      experience: [
        { id: "lucia-data-exp", role: "Científica de datos", company: "Empresa de ejemplo", durationYears: 2, description: "Preparación de datos y entrenamiento de modelos predictivos." },
      ],
      tags: ["Python", "TensorFlow", "SQL"],
    },
    desarrollo: {
      courses: [
        { id: "lucia-dev-course", name: "Desarrollo de APIs para modelos de IA", institution: "Curso de ejemplo", year: 2023 },
      ],
      certifications: [],
      experience: [],
      tags: ["Python"],
    },
  },
  "cand-rodrigo-baptista": {
    "cloud-devops": {
      courses: [
        { id: "rodrigo-cloud-course", name: "Integración y despliegue continuo", institution: "Curso de ejemplo", year: 2024 },
      ],
      certifications: [],
      experience: [
        { id: "rodrigo-cloud-exp", role: "Ingeniero DevOps", company: "Empresa de ejemplo", durationYears: 2, description: "Automatización de pipelines y despliegues." },
      ],
      tags: ["Docker", "CI/CD", "Linux"],
    },
    ciberseguridad: {
      courses: [
        { id: "rodrigo-sec-course", name: "Seguridad de contenedores", institution: "Curso de ejemplo", year: 2023 },
      ],
      certifications: [], experience: [], tags: ["Linux"],
    },
  },
  "cand-valentina-cruz": {
    "cloud-devops": {
      courses: [
        { id: "valentina-cloud-course", name: "Arquitecturas de nube con Kubernetes", institution: "Curso de ejemplo", year: 2024 },
      ],
      certifications: [
        { id: "valentina-cloud-cert", name: "Fundamentos de arquitectura AWS", issuer: "Programa de demostración", year: 2023 },
      ],
      experience: [
        { id: "valentina-cloud-exp", role: "Arquitecta cloud", company: "Empresa de ejemplo", durationYears: 3, description: "Diseño de infraestructura como código." },
      ],
      tags: ["AWS", "Kubernetes", "Terraform"],
    },
    "gobernanza-ti": {
      courses: [
        { id: "valentina-ti-course", name: "Gobernanza de servicios en la nube", institution: "Curso de ejemplo", year: 2024 },
      ],
      certifications: [], experience: [], tags: ["Terraform"],
    },
  },
  "cand-diego-alvarado": {
    qa: {
      courses: [
        { id: "diego-qa-course", name: "Automatización de pruebas web", institution: "Curso de ejemplo", year: 2024 },
      ],
      certifications: [],
      experience: [
        { id: "diego-qa-exp", role: "Líder de aseguramiento de calidad", company: "Empresa de ejemplo", durationYears: 2, description: "Planificación de pruebas automatizadas y regresión." },
      ],
      tags: ["Selenium", "Cypress", "Jest"],
    },
    desarrollo: {
      courses: [
        { id: "diego-dev-course", name: "Pruebas unitarias con JavaScript", institution: "Curso de ejemplo", year: 2023 },
      ],
      certifications: [], experience: [], tags: ["Jest"],
    },
  },
  "cand-mariana-gutierrez": {
    ciberseguridad: {
      courses: [
        { id: "mariana-sec-course", name: "Seguridad de aplicaciones web", institution: "Curso de ejemplo", year: 2024 },
      ],
      certifications: [
        { id: "mariana-sec-cert", name: "Fundamentos de seguridad informática", issuer: "Programa de demostración", year: 2023 },
      ],
      experience: [
        { id: "mariana-sec-exp", role: "Ingeniera de seguridad", company: "Empresa de ejemplo", durationYears: 2, description: "Evaluación de vulnerabilidades y controles de seguridad." },
      ],
      tags: ["OWASP", "Pentesting", "ISO 27001"],
    },
    "gobernanza-ti": {
      courses: [
        { id: "mariana-ti-course", name: "Gestión de riesgos de TI", institution: "Curso de ejemplo", year: 2023 },
      ],
      certifications: [], experience: [], tags: ["ISO 27001"],
    },
  },
};

/** Construye HU4 usando el candidato seleccionado, nunca los datos de otra persona. */
export function getCandidateAreaDetail(candidate: Candidate, areaId: AreaId): AreaDetail {
  const score = candidate.scores[areaId];
  const average = Math.round(
    (AFFINITY_AXES.reduce((sum, axis) => sum + candidate.scores[axis.id], 0) / AFFINITY_AXES.length) * 100,
  ) / 100;
  const evidence = candidate.id === "cand-carlos-mendoza"
    ? AREA_DETAILS[areaId]
    : CANDIDATE_EVIDENCE[candidate.id]?.[areaId];

  return {
    id: areaId,
    name: AFFINITY_AXES.find((axis) => axis.id === areaId)?.label ?? areaId,
    score,
    level: getAreaLevel(score),
    globalAverage: average,
    gap: calculateGap(score, average),
    courses: evidence?.courses ?? [],
    certifications: evidence?.certifications ?? [],
    experience: evidence?.experience ?? [],
    tags: evidence?.tags ?? [],
  };
}

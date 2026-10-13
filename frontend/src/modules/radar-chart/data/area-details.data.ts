import type { AreaDetail, AreaId } from "../types/area-detail.types";
import { calculateGap } from "../utils/calculate-gap";
import { getAreaLevel } from "../utils/get-area-level";

export const CANDIDATE = {
  name: "Carlos Mendoza Ríos",
  title: "Senior Software Engineer",
} as const;

export const GLOBAL_AVERAGE = 6.25;

export const AREA_ORDER: AreaId[] = [
  "desarrollo",
  "cloud-devops",
  "data-ai",
  "qa",
  "ciberseguridad",
  "gobernanza-ti",
];

type AreaDetailSeed = Omit<AreaDetail, "level" | "globalAverage" | "gap">;

function buildAreaDetail(seed: AreaDetailSeed): AreaDetail {
  return {
    ...seed,
    level: getAreaLevel(seed.score),
    globalAverage: GLOBAL_AVERAGE,
    gap: calculateGap(seed.score, GLOBAL_AVERAGE),
  };
}

export const AREA_DETAILS: Record<AreaId, AreaDetail> = {
  desarrollo: buildAreaDetail({
    id: "desarrollo",
    name: "Desarrollo",
    score: 8.5,
    courses: [
      {
        id: "desarrollo-course-1",
        name: "Arquitectura de software avanzada",
        institution: "Platzi",
        year: 2024,
      },
      {
        id: "desarrollo-course-2",
        name: "React y TypeScript profesional",
        institution: "Udemy",
        year: 2023,
      },
    ],
    certifications: [
      {
        id: "desarrollo-cert-1",
        name: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services",
        year: 2023,
        credentialId: "AWS-DVA-7Q2K9X",
      },
    ],
    experience: [
      {
        id: "desarrollo-exp-1",
        role: "Ingeniero de software sénior",
        company: "NovaTech",
        durationYears: 3,
        description:
          "Diseño e implementación de microservicios y aplicaciones web para el sector financiero.",
      },
      {
        id: "desarrollo-exp-2",
        role: "Desarrollador Full Stack",
        company: "Andes Digital",
        durationYears: 2,
      },
    ],
    tags: ["React", "Node.js", "Microservicios", "AWS", "Inglés B2"],
  }),
  "cloud-devops": buildAreaDetail({
    id: "cloud-devops",
    name: "Cloud/DevOps",
    score: 7,
    courses: [
      {
        id: "cloud-devops-course-1",
        name: "Orquestación de contenedores con Kubernetes en entornos de producción de alta disponibilidad",
        institution: "Linux Foundation Training and Certification",
        year: 2024,
      },
      {
        id: "cloud-devops-course-2",
        name: "Infraestructura como código con Terraform y gestión de estado remoto multi-cuenta",
        institution: "HashiCorp Learn",
        year: 2024,
      },
      {
        id: "cloud-devops-course-3",
        name: "Integración y despliegue continuo con GitHub Actions",
        institution: "Platzi",
        year: 2023,
      },
      {
        id: "cloud-devops-course-4",
        name: "Observabilidad y monitoreo con Prometheus y Grafana",
        institution: "Coursera",
        year: 2022,
      },
    ],
    certifications: [
      {
        id: "cloud-devops-cert-1",
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        year: 2024,
        credentialId: "AWS-SAA-4M8T1B",
      },
      {
        id: "cloud-devops-cert-2",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation",
        year: 2024,
        credentialId: "LF-CKA-2400-018873",
      },
      {
        id: "cloud-devops-cert-3",
        name: "HashiCorp Certified: Terraform Associate (003)",
        issuer: "HashiCorp",
        year: 2023,
      },
    ],
    experience: [
      {
        id: "cloud-devops-exp-1",
        role: "Líder técnico de plataforma e infraestructura en la nube",
        company: "NovaTech Soluciones Empresariales S.R.L.",
        durationYears: 2,
        description:
          "Migración de una plataforma monolítica a una arquitectura de contenedores sobre Amazon EKS, con pipelines de despliegue continuo, entornos efímeros por rama y reducción del tiempo de entrega de dos semanas a un día.",
      },
      {
        id: "cloud-devops-exp-2",
        role: "Ingeniero DevOps",
        company: "Andes Digital",
        durationYears: 1.5,
        description:
          "Automatización de la infraestructura con Terraform y configuración de monitoreo y alertas.",
      },
      {
        id: "cloud-devops-exp-3",
        role: "Administrador de sistemas Linux",
        company: "Cooperativa de Telecomunicaciones Cochabamba",
        durationYears: 1,
      },
    ],
    tags: [
      "Kubernetes",
      "Docker",
      "Terraform",
      "CI/CD",
      "Amazon Web Services",
      "Observabilidad",
    ],
  }),
  "data-ai": buildAreaDetail({
    id: "data-ai",
    name: "Data/AI",
    score: 6.5,
    courses: [
      {
        id: "data-ai-course-1",
        name: "Fundamentos de machine learning con Python",
        institution: "Coursera",
        year: 2023,
      },
      {
        id: "data-ai-course-2",
        name: "Ingeniería de datos con Apache Spark",
        institution: "Databricks Academy",
        year: 2023,
      },
      {
        id: "data-ai-course-3",
        name: "SQL avanzado para análisis de datos",
        institution: "Platzi",
        year: 2022,
      },
    ],
    certifications: [
      {
        id: "data-ai-cert-1",
        name: "Google Data Analytics Professional Certificate",
        issuer: "Google",
        year: 2023,
        credentialId: "GDA-9F3L2P",
      },
      {
        id: "data-ai-cert-2",
        name: "Microsoft Certified: Azure AI Fundamentals",
        issuer: "Microsoft",
        year: 2022,
      },
    ],
    experience: [
      {
        id: "data-ai-exp-1",
        role: "Desarrollador de pipelines de datos",
        company: "NovaTech",
        durationYears: 1.5,
        description:
          "Construcción de procesos ETL y tableros de indicadores para el área comercial.",
      },
    ],
    tags: ["Python", "SQL", "Pandas", "Apache Spark", "Machine Learning"],
  }),
  qa: buildAreaDetail({
    id: "qa",
    name: "QA",
    score: 5,
    courses: [
      {
        id: "qa-course-1",
        name: "Automatización de pruebas con Playwright",
        institution: "Test Automation University",
        year: 2023,
      },
      {
        id: "qa-course-2",
        name: "Pruebas unitarias y TDD con Vitest",
        institution: "Udemy",
        year: 2022,
      },
    ],
    certifications: [
      {
        id: "qa-cert-1",
        name: "ISTQB Certified Tester Foundation Level",
        issuer: "ISTQB",
        year: 2022,
        credentialId: "CTFL-22-BO-00417",
      },
    ],
    experience: [
      {
        id: "qa-exp-1",
        role: "Responsable de pruebas automatizadas",
        company: "Andes Digital",
        durationYears: 1,
        description:
          "Definición de la estrategia de pruebas de regresión y cobertura mínima del equipo.",
      },
    ],
    tags: ["Playwright", "Vitest", "TDD", "Pruebas de regresión"],
  }),
  ciberseguridad: buildAreaDetail({
    id: "ciberseguridad",
    name: "Ciberseguridad",
    score: 4.5,
    courses: [
      {
        id: "ciberseguridad-course-1",
        name: "Seguridad en aplicaciones web con OWASP Top 10",
        institution: "Platzi",
        year: 2023,
      },
      {
        id: "ciberseguridad-course-2",
        name: "Introducción al hacking ético",
        institution: "Cisco Networking Academy",
        year: 2021,
      },
    ],
    certifications: [
      {
        id: "ciberseguridad-cert-1",
        name: "CompTIA Security+",
        issuer: "CompTIA",
        year: 2022,
        credentialId: "COMP001022384756",
      },
    ],
    experience: [
      {
        id: "ciberseguridad-exp-1",
        role: "Referente de seguridad del equipo de desarrollo",
        company: "NovaTech",
        durationYears: 1,
        description:
          "Revisión de dependencias vulnerables y gestión de secretos en los repositorios.",
      },
    ],
    tags: ["OWASP", "Autenticación OAuth 2.0", "Gestión de secretos"],
  }),
  "gobernanza-ti": buildAreaDetail({
    id: "gobernanza-ti",
    name: "Gobernanza TI",
    score: 6,
    courses: [
      {
        id: "gobernanza-ti-course-1",
        name: "Gestión de servicios de TI con ITIL 4",
        institution: "Coursera",
        year: 2023,
      },
      {
        id: "gobernanza-ti-course-2",
        name: "Gobierno de TI con COBIT 2019",
        institution: "ISACA",
        year: 2022,
      },
      {
        id: "gobernanza-ti-course-3",
        name: "Gestión de proyectos ágiles con Scrum",
        institution: "Udemy",
        year: 2021,
      },
    ],
    certifications: [
      {
        id: "gobernanza-ti-cert-1",
        name: "ITIL 4 Foundation",
        issuer: "PeopleCert",
        year: 2023,
        credentialId: "GR671284915CM",
      },
      {
        id: "gobernanza-ti-cert-2",
        name: "Professional Scrum Master I",
        issuer: "Scrum.org",
        year: 2021,
      },
    ],
    experience: [
      {
        id: "gobernanza-ti-exp-1",
        role: "Scrum Master",
        company: "Andes Digital",
        durationYears: 1.5,
        description:
          "Facilitación de ceremonias y seguimiento de métricas de entrega de dos equipos.",
      },
      {
        id: "gobernanza-ti-exp-2",
        role: "Coordinador de procesos de TI",
        company: "NovaTech",
        durationYears: 1,
      },
    ],
    tags: ["ITIL 4", "COBIT", "Scrum", "Gestión de riesgos"],
  }),
};

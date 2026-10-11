import type { TrajectoryStep } from "../types/trajectory-step.types";

export const TRAJECTORY_STEPS: TrajectoryStep[] = [
  {
    id: "education",
    number: "01",
    label: "Formación académica",
    href: "/profile/trajectory/education",
  },
  {
    id: "experience",
    number: "02",
    label: "Experiencia laboral",
    href: "/profile/trajectory/experience",
  },
  {
    id: "skills",
    number: "03",
    label: "Habilidades",
    href: "/profile/trajectory/skills",
  },
  {
    id: "certifications",
    number: "04",
    label: "Certificaciones",
    href: "/profile/trajectory/certifications",
  },
];

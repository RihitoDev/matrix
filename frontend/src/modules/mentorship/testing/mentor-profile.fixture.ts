import type { MentorProfile } from "../types/mentor-profile.types";

export const MENTOR_PROFILE_FIXTURE: MentorProfile = {
  id: "0424f370-00f0-43cf-9b8a-997af81840b9",
  fullName: "Ana Rojas",
  headline: "Arquitecta de Software",
  aboutMe: "Mentora de ingeniería de software.",
  isAvailable: true,
  photoUrl: null,
  city: {
    id: "e830d438-d63d-4c7c-a6de-2fe9481821fc",
    title: "Cochabamba",
  },
  educations: [
    {
      id: "b679c31a-2545-43a9-91ac-f254b49e7b0c",
      institution: "Universidad Mayor de San Simón",
      degree: "Licenciatura en Ingeniería de Sistemas",
      startDate: "2012-02-01T00:00:00.000Z",
      endDate: "2017-12-01T00:00:00.000Z",
      description: null,
    },
  ],
  workExperiences: [
    {
      id: "34ac0d39-3e5d-465a-ae6b-4628bb2d0ae7",
      position: "Tech Lead",
      startDate: "2022-01-01T00:00:00.000Z",
      endDate: null,
      isCurrent: true,
      description: "Liderazgo técnico",
      company: {
        id: "6887d6d6-717e-4c08-a6cf-613635478f73",
        title: "Acme",
      },
    },
  ],
  skills: [
    {
      id: "eaab8d67-61f8-45da-8bdd-a9c707207f7f",
      name: "TypeScript",
      isCustom: false,
    },
    {
      id: "1b97bc7a-eb58-47dc-a75d-7d28bd72f047",
      name: "Arquitectura de software",
      isCustom: false,
    },
  ],
  certifications: [
    {
      id: "16744aa3-a094-4621-b405-f1e37a5e122a",
      name: "Cloud Architect",
      issuingOrganization: "Cloud Org",
      issueDate: "2025-06-15T00:00:00.000Z",
      documentUrl: null,
    },
  ],
  technicalAreas: [
    {
      id: "f05e6312-d36c-4a18-9305-6bf9932108bd",
      name: "Backend",
      description: null,
    },
    {
      id: "bf086d38-0994-4a39-b63a-61f135f33e20",
      name: "Arquitectura",
      description: "Diseño de software",
    },
  ],
  orientationTypes: [
    {
      id: "0fa5e6de-63a4-430e-87fb-22f5eb700ecd",
      name: "Orientación técnica",
      description: "Revisión de decisiones técnicas.",
    },
    {
      id: "26161fc5-a5d8-4d2a-bda7-504b3d24d7d8",
      name: "Revisión de CV",
      description: "Revisión del contenido y estructura del currículum.",
    },
  ],
};

// Los títulos de los catálogos deben coincidir con los que envía el frontend
// (create-job-offer.schema.ts) y con JOB_OFFER_PUBLISHED_STATUS del servicio.
export const SEED_JOB_OFFER_MODALITIES = ['Presencial', 'Remoto', 'Híbrido'] as const;

export const SEED_JOB_OFFER_CONTRACT_TYPES = ['Tiempo completo', 'Medio tiempo', 'Pasantía'] as const;

export const SEED_JOB_OFFER_STATUSES = ['Borrador', 'Publicada', 'Pausada', 'Cerrada', 'Archivada'] as const;

// Catálogo cerrado de tecnologías del mockup (GET /skills).
export const SEED_JOB_OFFER_SKILLS = [
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'SQL',
  'PostgreSQL',
  'Docker',
  'Kubernetes',
  'Git',
  'Linux',
  'Django',
  'FastAPI',
  'Vue.js',
  'Angular',
  'MongoDB',
  'Redis',
  'Rust',
  'Assembly',
] as const;

// Empresas de demostración. Los ids fijos permiten configurar NEXT_PUBLIC_DEMO_COMPANY_ID
// en el frontend sin consultar la base; si la empresa ya existía, se conserva su id.
export const SEED_JOB_OFFER_COMPANIES = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    title: 'TechBolivia S.R.L.',
    description: 'Empresa de desarrollo de software con sede en Cochabamba.',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    title: 'NovaSoft Bolivia',
    description: 'Consultora de tecnología especializada en aplicaciones web.',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    title: 'Andes Data Labs',
    description: 'Laboratorio de análisis de datos e inteligencia artificial.',
  },
] as const;

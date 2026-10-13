import {
  JobOfferContractType,
  JobOfferModality,
  JobOfferStatus,
} from '../types/job-offer.enum.js';

export const SEED_JOB_OFFER_MODALITIES = Object.values(JobOfferModality);

export const SEED_JOB_OFFER_CONTRACT_TYPES = Object.values(JobOfferContractType);

export const SEED_JOB_OFFER_STATUSES = Object.values(JobOfferStatus);

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

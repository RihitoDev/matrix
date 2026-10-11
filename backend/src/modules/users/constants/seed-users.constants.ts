import type { SeedUserDefinition } from '../types/seed-user-definition.types.js';
import type { SeedUserKey } from '../types/seed-user-key.types.js';

export const SEED_PASSWORD = 'Prueba123';
export const BCRYPT_ROUNDS = 10;

export const EPIC_1_TEST_USER: SeedUserDefinition = {
  firstName: 'Usuario',
  lastName: 'De Prueba',
  email: 'prueba@umss.edu.bo',
  role: 'titulado',
};

export const SEED_USERS: ReadonlyArray<
  SeedUserDefinition & { key: SeedUserKey }
> = [
  {
    key: 'emptyGraduate',
    firstName: 'Usuario',
    lastName: 'Sin Pases',
    email: 'sinpases@umss.edu.bo',
    role: 'titulado',
  },
  {
    key: 'mentorA',
    firstName: 'Mentor',
    lastName: 'Alfa',
    email: 'mentor.a@umssy.test',
    role: 'mentor',
  },
  {
    key: 'mentorB',
    firstName: 'Mentor',
    lastName: 'Beta',
    email: 'mentor.b@umssy.test',
    role: 'mentor',
  },
  {
    key: 'graduate',
    firstName: 'Titulado',
    lastName: 'Uno',
    email: 'titulado.1@umssy.test',
    role: 'titulado',
  },
  {
    key: 'student',
    firstName: 'Estudiante',
    lastName: 'Uno',
    email: 'estudiante.1@umssy.test',
    role: 'estudiante',
  },
  {
    key: 'admin',
    firstName: 'Admin',
    lastName: 'Uno',
    email: 'admin.1@umssy.test',
    role: 'administrativo',
  },
];

export const LEGACY_ROLES = ['MENTOR', 'TITULADO'];

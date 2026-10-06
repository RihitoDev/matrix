// modules/chat/types/user.types.ts

export type UserRole =
  | 'STUDENT'
  | 'GRADUATE'
  | 'MENTOR'
  | 'RECRUITER'
  | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  headline: string | null;   
  isActive: boolean;         
}


export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Estudiante',
  GRADUATE: 'Titulado',
  MENTOR: 'Mentor',
  RECRUITER: 'Empresa',
  ADMIN: 'Administrador',
};
// Minimal shape of a Standard Schema issue (Zod 4 implements this spec).
export interface ValidationIssue {
  message: string;
  path?: readonly (PropertyKey | { key: PropertyKey })[];
}

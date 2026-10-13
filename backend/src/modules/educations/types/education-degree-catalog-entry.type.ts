import type { EducationDegree } from './education-degree.type.js';

export interface EducationDegreeCatalogEntry {
  readonly institution: string;
  readonly sources: readonly string[];
  readonly degrees: readonly EducationDegree[];
}


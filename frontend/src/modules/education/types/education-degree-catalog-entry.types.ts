import type { EducationDegree } from './education-degree.types';

export interface EducationDegreeCatalogEntry {
  readonly institution: string;
  readonly sources: readonly string[];
  readonly degrees: readonly EducationDegree[];
}


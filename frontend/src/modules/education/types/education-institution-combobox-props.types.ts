import type { EducationInstitution } from './education-institution.types';

export interface EducationInstitutionComboboxProps {
  id: string;
  value: string;
  institutions: readonly EducationInstitution[];
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

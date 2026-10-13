import type { EducationDegree } from './education-degree.types';

export interface EducationDegreeComboboxProps {
  id: string;
  value: string;
  degrees: readonly EducationDegree[];
  error?: string;
  disabled?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}

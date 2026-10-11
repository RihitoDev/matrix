import type { ReactNode } from "react";

export interface FormFieldProps {
  id: string;
  label: string;
  isRequired?: boolean;
  error?: string;
  children: ReactNode;
}

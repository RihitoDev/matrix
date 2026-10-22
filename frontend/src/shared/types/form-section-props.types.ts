import type { ReactNode } from "react";
export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

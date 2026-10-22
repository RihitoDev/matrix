import type { ReactNode } from "react";

export interface PageHeadingProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

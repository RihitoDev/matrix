import type { ReactNode } from "react";
export interface WorkspacePageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

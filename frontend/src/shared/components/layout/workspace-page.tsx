import { cn } from "cn";
import type { WorkspacePageProps } from "@/shared/types/workspace-page-props.types";
import { PageHeading } from "./page-heading";

export function WorkspacePage({ title, description, actions, children, className }: WorkspacePageProps) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl space-y-6", className)}>
      <PageHeading title={title} description={description} actions={actions} />
      {children}
    </main>
  );
}

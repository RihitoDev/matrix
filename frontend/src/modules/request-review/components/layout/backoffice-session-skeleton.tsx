import { Skeleton } from "@/components/ui/skeleton";

// Mientras se resuelve la sesión (o se redirige) el contenido es un esqueleto neutro dentro del mismo shell del backoffice
export function BackofficeSessionSkeleton() {
  return (
    <div className="w-full min-w-0" data-testid="backoffice-session-skeleton" aria-busy="true">
      <div className="w-full border-b border-border bg-surface px-8 py-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-2 h-6 w-48" />
      </div>
      <div className="flex w-full min-w-0 flex-col gap-4 p-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

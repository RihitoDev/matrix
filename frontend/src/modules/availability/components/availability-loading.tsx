import { Skeleton } from "@/components/ui/skeleton";

export function AvailabilityLoading() {
  return (
    <div className="space-y-2 p-6" aria-busy="true">
      <span className="sr-only">Cargando disponibilidad...</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type MentorQuerySkeletonProps = {
  isProfile?: boolean;
};

export function MentorQuerySkeleton({
  isProfile = false,
}: MentorQuerySkeletonProps) {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label={
        isProfile
          ? "Cargando perfil del mentor"
          : "Cargando directorio de mentores"
      }
    >
      <p className="mb-4 text-sm text-text-secondary">
        {isProfile
          ? "Cargando perfil del mentor..."
          : "Cargando directorio de mentores..."}
      </p>

      <div
        aria-hidden="true"
        className={
          isProfile
            ? "grid gap-5"
            : "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {Array.from({ length: isProfile ? 2 : 6 }, (_, index) => (
          <Card
            key={index}
            className="gap-0 overflow-visible rounded-xl border border-border bg-surface py-0 text-base ring-0"
          >
            <CardContent className="space-y-5 p-6">
              <Skeleton className="h-6 w-2/3 motion-reduce:animate-none" />
              <Skeleton className="h-4 w-1/2 motion-reduce:animate-none" />
              <Skeleton className="h-16 w-full motion-reduce:animate-none" />
              <Skeleton className="h-9 w-full motion-reduce:animate-none" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

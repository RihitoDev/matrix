"use client";

import { MentorDirectoryGrid } from "../components/mentor/mentor-directory-grid";
import { MentorQueryFeedback } from "../components/mentor/mentor-query-feedback";
import { MentorQuerySkeleton } from "../components/mentor/mentor-query-skeleton";
import { useMentorDirectory } from "../hooks/use-mentor-directory";

export function MentorDirectoryView() {
  const { data: mentors, isPending, isError, isFetching, refetch } =
    useMentorDirectory();

  return (
    <main className="min-h-full bg-surface-soft px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <h1 className="font-tight text-2xl font-bold text-ink sm:text-3xl">
            Directorio de mentores
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-text-secondary sm:text-base">
            Conoce a los mentores activos y sus principales áreas de
            experiencia profesional.
          </p>
        </header>

        {isPending || (isError && isFetching) ? (
          <MentorQuerySkeleton />
        ) : isError ? (
          <MentorQueryFeedback
            title="No pudimos cargar el directorio"
            description="Ocurrió un problema al consultar los perfiles. Puedes volver a intentarlo."
            onRetry={() => {
              void refetch();
            }}
          />
        ) : mentors.length === 0 ? (
          <MentorQueryFeedback
            title="No hay mentores activos"
            description="Por el momento no hay mentores activos para mostrar. Vuelve a consultar más adelante."
          />
        ) : (
          <MentorDirectoryGrid mentors={mentors} />
        )}
      </div>
    </main>
  );
}

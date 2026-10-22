"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeSearch } from "@/shared/utils/get-workspace-tasks";
import { PageHeading } from "@/shared/components/layout";
import { MentorDirectoryGrid } from "../components/mentor/mentor-directory-grid";
import { MentorQueryFeedback } from "../components/mentor/mentor-query-feedback";
import { MentorQuerySkeleton } from "../components/mentor/mentor-query-skeleton";
import { useCurrentUserId } from "../hooks/use-current-user-id";
import { useMentorDirectory } from "../hooks/use-mentor-directory";

export function MentorDirectoryView() {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const { currentUserId } = useCurrentUserId();
  const { data: mentors, isPending, isError, isFetching, refetch } =
    useMentorDirectory();

  const areas = [...new Set((mentors ?? []).flatMap((mentor) => mentor.technicalAreas))].sort((a,b) => a.localeCompare(b,"es"));
  const filteredMentors = (mentors ?? []).filter((mentor) => normalizeSearch([mentor.fullName,mentor.headline,...mentor.technicalAreas].join(" ")).includes(normalizeSearch(search)) && (!area || mentor.technicalAreas.includes(area)) && (!isAvailableOnly || mentor.isAvailable));
  function handleClearFilters() { setSearch(""); setArea(""); setIsAvailableOnly(false); }
  return (
    <main className="min-h-full bg-surface-soft">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header>
          <PageHeading title="Encuentra un mentor" description="Busca por nombre o área de experiencia." />
        </header>

        <div role="search" aria-label="Filtros de mentores" className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4">
          <Input type="search" className="min-w-56 flex-1" aria-label="Buscar mentor" placeholder="Nombre o especialidad" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">Área<select className="h-10 max-w-64 rounded-md border border-border bg-surface px-3 text-ink focus-visible:ring-2 focus-visible:ring-accent" value={area} onChange={(event) => setArea(event.target.value)}><option value="">Todas las áreas</option>{areas.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" className="size-4 accent-accent" checked={isAvailableOnly} onChange={(event) => setIsAvailableOnly(event.target.checked)} />Con disponibilidad</label>
          {search || area || isAvailableOnly ? <Button variant="ghost" onClick={handleClearFilters}>Limpiar filtros</Button> : null}
        </div>
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
          <><p role="status" className="text-sm text-text-secondary">{filteredMentors.length} mentores encontrados</p>{filteredMentors.length ? <MentorDirectoryGrid mentors={filteredMentors} currentUserId={currentUserId} /> : <div className="rounded-lg border border-border bg-surface p-8 text-center"><h2 className="mb-4 text-lg font-semibold">No hay mentores con estos filtros</h2><Button variant="outline" onClick={handleClearFilters}>Limpiar filtros</Button></div>}</>
        )}
      </div>
    </main>
  );
}

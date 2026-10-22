"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, Search, SearchX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/shared/components/layout";
import { useVacancies } from "../hooks/use-vacancies";

export function VacanciesView() {
  const { search, setSearch, filteredVacancies } = useVacancies();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeading
        title="Vacantes"
        description="Encuentra oportunidades laborales para egresados."
      />

      <section aria-label="Buscar vacantes" className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
        <div className="relative w-full max-w-xl">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-4 text-text-secondary" />
          <Input
            type="search"
            aria-label="Buscar vacantes por cargo, empresa o requisito"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cargo, empresa o requisito"
            className="pl-10"
          />
        </div>
        <p role="status" className="text-sm tabular-nums text-text-secondary">
          {filteredVacancies.length}{" "}
          {filteredVacancies.length === 1 ? "vacante encontrada" : "vacantes encontradas"}
        </p>
      </section>

      {filteredVacancies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <SearchX aria-hidden="true" className="size-8 text-ink-soft" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-ink">No se encontraron vacantes</h2>
          <p className="max-w-md text-sm text-text-secondary">
            Prueba con otro cargo, empresa o requisito para ampliar tu búsqueda.
          </p>
          {search ? (
            <Button variant="outline" onClick={() => setSearch("")} className="mt-2">
              Limpiar búsqueda
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredVacancies.map((vacancy) => (
            <article key={vacancy.id} className="flex min-w-0 flex-col rounded-lg border border-border bg-surface p-6">
              <h2 className="text-xl font-bold text-ink">{vacancy.cargo}</h2>
              <p className="mt-1 text-sm font-medium text-ink-soft">{vacancy.empresa}</p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{vacancy.descripcion}</p>

              <dl className="my-5 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-4 text-sm">
                <div>
                  <dt className="text-xs text-text-secondary">Salario</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-ink">{vacancy.salario}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin aria-hidden="true" className="size-3.5" /> Ubicación
                  </dt>
                  <dd className="mt-1 text-ink">{vacancy.ubicacion}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <BriefcaseBusiness aria-hidden="true" className="size-3.5" /> Contrato
                  </dt>
                  <dd className="mt-1 text-ink">{vacancy.tipoContrato}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Jornada</dt>
                  <dd className="mt-1 text-ink">{vacancy.jornada}</dd>
                </div>
              </dl>

              <h3 className="text-sm font-semibold text-ink">Requisitos</h3>
              <ul className="mb-6 mt-2 list-disc space-y-1 pl-4 text-sm text-text-secondary marker:text-border-strong">
                {vacancy.requisitos.map((requirement, index) => (
                  <li key={`${index}-${requirement}`}>{requirement}</li>
                ))}
              </ul>
              <div className="mt-auto flex justify-end border-t border-border pt-4">
                <Link
                  href={`/vacancies/${vacancy.id}`}
                  className={buttonVariants({ variant: "outline" })}
                  aria-label={`Ver detalles de ${vacancy.cargo}`}
                >
                  Ver detalles <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
        <ArrowLeft aria-hidden="true" /> Volver al inicio
      </Link>
    </main>
  );
}

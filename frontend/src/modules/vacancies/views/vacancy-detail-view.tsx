import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { vacancies } from "../data/vacancies";
import type { VacancyDetailViewProps } from "../types/vacancy-detail-view-props.types";

export function VacancyDetailView({ id }: VacancyDetailViewProps) {
  const vacancy = vacancies.find(
    (vacancy) => vacancy.id === Number(id),
  );

  if (!vacancy) {
    return (
      <main className="flex min-h-full items-center justify-center bg-surface-soft p-6">
        <div className="rounded-lg bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            Vacante no encontrada
          </h1>

          <Link
            href="/vacancies"
            className="mt-6 inline-block rounded-md bg-ink px-4 py-2 text-surface"
          >
            <ArrowLeft className="mr-2 inline size-4" aria-hidden="true" />Volver a vacantes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-surface-soft">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/vacancies"
          className="mb-6 inline-block text-sm font-medium"
        >
          <ArrowLeft className="mr-2 inline size-4" aria-hidden="true" />Volver a vacantes
        </Link>

        <article className="rounded-lg border border-border bg-surface p-8">
          <h1 className="text-3xl font-bold">
            {vacancy.cargo}
          </h1>

          <p className="mt-2 text-lg font-medium">
            {vacancy.empresa}
          </p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">
              Descripción
            </h2>

            <p className="mt-2 text-text-secondary">
              {vacancy.descripcion}
            </p>
          </div>

          <div className="my-7 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">
                Salario
              </h3>

              <p className="mt-1 text-text-secondary">
                {vacancy.salario}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Ubicación
              </h3>

              <p className="mt-1 text-text-secondary">
                {vacancy.ubicacion}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Tipo de contrato
              </h3>

              <p className="mt-1 text-text-secondary">
                {vacancy.tipoContrato}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Jornada
              </h3>

              <p className="mt-1 text-text-secondary">
                {vacancy.jornada}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">
              Requisitos
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
              {vacancy.requisitos.map((requisito, index) => (
                <li key={index}>
                  {requisito}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </main>
  );
}

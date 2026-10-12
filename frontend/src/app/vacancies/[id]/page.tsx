import { vacancies } from "@/modules/vacancies/data/vacancies";
import Link from "next/link";

interface VacancyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VacancyDetailPage({
  params,
}: VacancyDetailPageProps) {
  const { id } = await params;

  const vacancy = vacancies.find(
    (vacancy) => vacancy.id === Number(id),
  );

  if (!vacancy) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-soft p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">
            Vacante no encontrada
          </h1>

          <Link
            href="/vacantes"
            className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-white"
          >
            ← Volver a vacantes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-soft p-6">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/vacantes"
          className="mb-6 inline-block text-sm font-medium"
        >
          ← Volver a vacantes
        </Link>

        <article className="rounded-lg bg-white p-8 shadow">
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

            <p className="mt-2 text-gray-600">
              {vacancy.descripcion}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">
                Salario
              </h3>

              <p className="mt-1 text-gray-600">
                {vacancy.salario}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Ubicación
              </h3>

              <p className="mt-1 text-gray-600">
                {vacancy.ubicacion}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Tipo de contrato
              </h3>

              <p className="mt-1 text-gray-600">
                {vacancy.tipoContrato}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Jornada
              </h3>

              <p className="mt-1 text-gray-600">
                {vacancy.jornada}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">
              Requisitos
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-600">
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

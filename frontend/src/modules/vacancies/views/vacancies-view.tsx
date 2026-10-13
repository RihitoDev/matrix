"use client";
import Link from "next/link";
import { useVacancies } from "../hooks/use-vacancies";

export function VacanciesView() {
  const {
    search,
    setSearch,
    filteredVacancies,
  } = useVacancies();

  return (
    <main className="min-h-screen bg-surface-soft p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-bold">
          Vacantes
        </h1>

        <p className="mt-2 text-gray-600">
          Encuentra oportunidades laborales para egresados.
        </p>

        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cargo, empresa, requisito..."
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2"
          />
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            {filteredVacancies.length}{" "}
            {filteredVacancies.length === 1
              ? "vacante encontrada"
              : "vacantes encontradas"}
          </p>
        </div>

        {filteredVacancies.length === 0 ? (
          <div className="mt-6 rounded-lg bg-white p-6 text-center shadow">
            <p className="text-gray-600">
              No se encontraron vacantes.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {filteredVacancies.map((vacancy) => (
              <article
                key={vacancy.id}
                className="rounded-lg bg-white p-6 shadow"
              >
                <h2 className="text-xl font-bold">
                  {vacancy.cargo}
                </h2>

                <p className="mt-1 font-medium">
                  {vacancy.empresa}
                </p>

                <p className="mt-4 text-gray-600">
                  {vacancy.descripcion}
                </p>

                <div className="mt-4">
                  <p>
                    <strong>Salario:</strong>{" "}
                    {vacancy.salario}
                  </p>

                  <p>
                    <strong>Ubicación:</strong>{" "}
                    {vacancy.ubicacion}
                  </p>

                  <p>
                    <strong>Contrato:</strong>{" "}
                    {vacancy.tipoContrato}
                  </p>

                  <p>
                    <strong>Jornada:</strong>{" "}
                    {vacancy.jornada}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">
                    Requisitos:
                  </h3>

                  <ul className="mt-2 list-disc pl-5 text-gray-600">
                    {vacancy.requisitos.map(
                      (requisito, index) => (
                        <li key={index}>
                          {requisito}
                        </li>
                      ),
                    )}
                  </ul>
			<Link
			  href={`/vacantes/${vacancy.id}`}
			  className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-white"
			>
			  Ver detalles
			</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-black px-4 py-2 text-white"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}

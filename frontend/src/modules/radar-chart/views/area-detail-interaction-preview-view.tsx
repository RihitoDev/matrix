import { AreaDetailInteraction } from "../components/area-detail-interaction";

export function AreaDetailInteractionPreviewView() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">
          Prueba de interacción del detalle por área
        </h1>

        <AreaDetailInteraction initialArea="desarrollo" />
      </div>
    </main>
  );
}

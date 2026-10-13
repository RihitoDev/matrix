import { AreaDetailInteraction } from "../components/area-detail-interaction";
import { Epic3Shell } from "../components/epic3-shell";

export function AreaDetailInteractionPreviewView() {
  return (
    <Epic3Shell>
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-2xl font-bold">
            Prueba de interacción del detalle por área
          </h1>

          <AreaDetailInteraction initialArea="desarrollo" />
        </div>
      </main>
    </Epic3Shell>
  );
}
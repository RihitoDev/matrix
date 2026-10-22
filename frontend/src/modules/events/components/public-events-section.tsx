"use client";
import { usePublicEvents } from "../hooks/use-public-events";
import { PublicEventCard } from "./public-event-card";
import { Button } from "@/components/ui/button";
export function PublicEventsSection() {
  const query = usePublicEvents({ page: 1, limit: 3 });
  if (query.isPending) return <p role="status" className="py-8 text-text-secondary">Cargando talleres…</p>;
  if (query.isError) return <div className="rounded-lg border border-border p-6"><p className="mb-4 text-text-secondary">No pudimos cargar los talleres.</p><Button variant="outline" onClick={() => void query.refetch()}>Volver a intentar</Button></div>;
  if (!query.data.data.length) return <p className="py-8 text-text-secondary">Aún no hay talleres publicados. Vuelve pronto.</p>;
  return <div className="grid gap-5 md:grid-cols-3">{query.data.data.map((event) => <PublicEventCard key={event.id} event={event} />)}</div>;
}

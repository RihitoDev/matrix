import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "../types/event.types";
import { formatEventDate } from "../utils/event-card";
export function PublicEventCard({ event }: { event: EventItem }) {
  return <article className="flex flex-col rounded-lg border border-border bg-surface p-6"><p className="text-sm font-medium text-accent">{event.category.name}</p><h3 className="mb-5 mt-2 text-xl font-bold text-ink"><Link href={`/workshops/${encodeURIComponent(event.id)}`} className="hover:text-accent">{event.title}</Link></h3><div className="mt-auto space-y-2 text-sm text-text-secondary"><p className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0" aria-hidden="true" />{formatEventDate(event.eventDate)}</p><p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden="true" />{event.location?.trim() || "Lugar por confirmar"}</p></div><Link href={`/workshops/${encodeURIComponent(event.id)}`} className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-accent">Ver taller<ArrowUpRight className="size-4" aria-hidden="true" /></Link></article>;
}

import { formatShortDate } from "../../utils/format-long-date";
import type { HistoryCardProps } from "../../types/history-card-props.types";

const REVIEWER_LABELS: Record<string, string> = {
  in_review: "Abierta por",
  approved: "Aprobada por",
  rejected: "Rechazada por",
};

// Solo muestra lo que la respuesta de detalle ya trae (fechas y revisor)
export function HistoryCard({ detail }: HistoryCardProps) {
  const { history } = detail;
  const entries: Array<{ label: string; date: string | null }> = [];

  if (history?.submittedAt) {
    entries.push({ label: "Solicitud enviada por la persona titulada", date: formatShortDate(history.submittedAt) });
  }
  if (history?.reviewedBy && history.reviewedAt) {
    entries.push({
      label: `${REVIEWER_LABELS[detail.status] ?? "Revisada por"} ${history.reviewedBy}`,
      date: formatShortDate(history.reviewedAt),
    });
  }
  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-5" aria-label="Historial de esta solicitud">
      <h2 className="text-[15px] font-semibold text-ink">Historial de esta solicitud</h2>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2 text-sm text-ink">
            <span className="size-1.5 shrink-0 rounded-full bg-ink-soft" aria-hidden="true" />
            <span className="flex-1">{entry.label}</span>
            <span className="text-xs text-text-secondary">{entry.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

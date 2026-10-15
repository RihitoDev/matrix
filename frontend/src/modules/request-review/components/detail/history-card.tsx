import { formatShortDate } from "../../utils/format-long-date";
import type { HistoryCardProps } from "../../types/history-card-props.types";

const VERDICT_LABELS: Record<string, string> = {
  approved: "Aprobada por",
  rejected: "Rechazada por",
};

export function HistoryCard({ detail }: HistoryCardProps) {
  const { history, status } = detail;
  const entries: Array<{ label: string; date: string | null }> = [];
  const hasVerdict = status in VERDICT_LABELS;

  if (history?.submittedAt) {
    entries.push({ label: "Solicitud enviada por la persona titulada", date: formatShortDate(history.submittedAt) });
  }

  const openedAt = history?.openedAt ?? (hasVerdict ? null : history?.reviewedAt);
  const openedBy = history?.openedBy ?? (hasVerdict ? null : history?.reviewedBy);
  if (openedAt) {
    entries.push({ label: openedBy ? `Abierta por ${openedBy}` : "Solicitud abierta", date: formatShortDate(openedAt) });
  }

  if (hasVerdict && history?.reviewedBy && history.reviewedAt) {
    entries.push({ label: `${VERDICT_LABELS[status]} ${history.reviewedBy}`, date: formatShortDate(history.reviewedAt) });
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

"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { InboxSummary } from "../../types/inbox-summary.types";
import type { SummaryCardsProps } from "../../types/summary-cards-props.types";

const CONTAINER_CLASS = "grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border lg:grid-cols-4";
const CELL_CLASS = "flex flex-col gap-1 bg-surface px-5 py-4";
const TITLE_CLASS = "text-[15px] text-text-secondary";
const VALUE_CLASS = "font-tight text-[32px] font-bold leading-tight text-ink";
const NOTE_CLASS = "text-[14px] text-text-secondary";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function describeCards(summary: InboxSummary) {
  const { pendingOver24hCount, approvedTodayCount, rejectedTodayCount, averageReviewHours, reviewTimeGoalHours, topRejectionReason } = summary;
  return [
    {
      title: "Pendientes de dictamen",
      value: String(summary.pendingCount),
      note: pendingOver24hCount === 0 ? "Ninguna lleva más de 24 h" : `${pendingOver24hCount} ${pendingOver24hCount === 1 ? "lleva" : "llevan"} más de 24 h`,
    },
    {
      title: "Dictaminadas hoy",
      value: String(summary.decidedTodayCount),
      note: `${plural(approvedTodayCount, "aprobada", "aprobadas")}, ${plural(rejectedTodayCount, "rechazada", "rechazadas")}`,
    },
    {
      title: "Tiempo medio de dictamen",
      value: averageReviewHours === null ? "Sin datos" : `${averageReviewHours} h`,
      note: `Meta: menos de ${reviewTimeGoalHours} h`,
    },
    {
      title: "Rechazadas este mes",
      value: String(summary.rejectedThisMonthCount),
      note: topRejectionReason ? `Motivo principal: ${topRejectionReason}` : null,
    },
  ];
}

export function SummaryCards({ summary, isLoading, error, onRetry }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className={CONTAINER_CLASS} data-testid="summary-skeleton" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={CELL_CLASS}>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-9 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink">{error ?? "No se pudo cargar el resumen de la bandeja."}</p>
        <Button type="button" variant="outline" onClick={onRetry} className="h-[34px] rounded-lg border-border bg-surface px-4 text-[14px] font-semibold text-ink">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <dl className={CONTAINER_CLASS}>
      {describeCards(summary).map((card) => (
        <div key={card.title} className={CELL_CLASS}>
          <dt className={TITLE_CLASS}>{card.title}</dt>
          <dd className={VALUE_CLASS}>{card.value}</dd>
          {card.note ? <dd className={NOTE_CLASS}>{card.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

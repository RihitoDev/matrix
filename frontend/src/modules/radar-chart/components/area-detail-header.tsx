"use client";

import { X } from "lucide-react";
import type { AreaDetailHeaderProps } from "../types/area-detail-components.types";

export function AreaDetailHeader({ titleId, name, order, onClose }: AreaDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-surface px-6 pt-5 pb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-surface tabular-nums"
            aria-hidden="true"
          >
            {order}
          </span>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
            Área de afinidad
          </p>
        </div>
        <h2
          id={titleId}
          className="mt-2 font-heading text-2xl font-semibold tracking-tight break-words text-ink"
        >
          {name}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Información relevante del candidato seleccionado
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar detalle del área"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-surface text-accent outline-none hover:border-accent hover:bg-accent hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/40 motion-safe:transition-colors motion-safe:duration-150"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}

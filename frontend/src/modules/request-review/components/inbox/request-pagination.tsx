"use client";

import { Button } from "@/components/ui/button";
import type { RequestPaginationProps } from "../../types/request-pagination-props.types";

const BUTTON_CLASS = "h-[34px] rounded-lg border-border bg-surface px-4 text-[14px] font-semibold text-ink";

export function RequestPagination({ from, to, total, hasPrevious, hasNext, onPrevious, onNext }: RequestPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
      <p className="text-sm text-text-secondary">
        Mostrando {from} a {to} de {total} solicitudes, de la más reciente a la más antigua
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious} className={BUTTON_CLASS}>
          Anterior
        </Button>
        <Button variant="outline" onClick={onNext} disabled={!hasNext} className={BUTTON_CLASS}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

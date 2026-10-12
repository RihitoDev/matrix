import { Info } from 'lucide-react';
import { RequestFeedback } from './request-feedback';
import type { EventDetailStateProps } from '../types/event-detail-state-props.types';
export function EventDetailState({
  selectedId,
  isLoading,
  error,
  notFound,
  retry,
}: EventDetailStateProps) {
  return (
    <aside
      aria-label="Detalle del taller seleccionado"
      className="flex min-h-80 w-full shrink-0 items-center justify-center border-t border-border bg-surface p-8 text-center lg:min-h-svh lg:w-[340px] lg:self-stretch lg:border-l lg:border-t-0 xl:w-[360px]"
    >
      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
        {isLoading ? (
          <RequestFeedback message="Cargando detalle del taller..." />
        ) : error ? (
          <RequestFeedback
            message={error}
            isError
            onRetry={notFound ? undefined : retry}
            retryLabel="Reintentar detalle"
          />
        ) : (
          <h2 className="text-lg font-bold text-ink">Selecciona un taller</h2>
        )}
        {!selectedId && (
          <p className="text-xs leading-relaxed text-text-secondary">
            Elige un taller de la lista para ver su información y opciones de
            inscripción.
          </p>
        )}
        <div className="mt-2 flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-soft text-text-secondary">
          <Info aria-hidden="true" className="size-5" />
        </div>
      </div>
    </aside>
  );
}

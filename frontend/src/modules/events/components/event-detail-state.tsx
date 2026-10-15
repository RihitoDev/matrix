import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RequestFeedback } from './request-feedback';
import type { EventDetailStateProps } from '../types/event-detail-state-props.types';
export function EventDetailState({
  selectedId,
  isLoading,
  error,
  notFound,
  retry,
  onClose,
}: EventDetailStateProps) {
  return (
    <aside
      aria-label="Detalle del taller seleccionado"
      className="flex max-h-[55dvh] min-h-0 w-full shrink-0 overflow-y-auto overscroll-contain border-t border-border bg-surface p-8 text-center lg:h-full lg:max-h-none lg:w-[340px] lg:border-l lg:border-t-0 xl:w-[360px]"
    >
      <div className="m-auto flex max-w-xs flex-col items-center gap-3">
        {selectedId && onClose && (
          <Button variant="outline" onClick={onClose}>Cerrar detalle</Button>
        )}
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

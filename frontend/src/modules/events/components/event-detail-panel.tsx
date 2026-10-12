import { Card } from '@/components/ui/card';
import { CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  calculateEventCapacityStatus,
  formatEventDate,
  formatTimeRange,
} from '../utils/event-card';
import { DetailRow } from './detail-row';
import { hasValidEventCapacity } from '../utils/has-valid-event-capacity';

import type { EventDetailPanelProps } from '../types/event-detail-panel-props.types';

export function EventDetailPanel({ event }: EventDetailPanelProps) {
  const hasValidCapacity = hasValidEventCapacity(event);
  const { enrolledCount, capacity, progressPercentage, isFull } =
    calculateEventCapacityStatus(event);
  const availableSpots = event.availableSpots;

  return (
    <aside
      aria-label={`Detalle de ${event.title}`}
      className="w-full shrink-0 border-t border-border bg-surface lg:min-h-svh lg:w-[340px] lg:self-stretch lg:border-l lg:border-t-0 xl:w-[360px]"
    >
      <Card className="gap-0 rounded-none border-0 shadow-none bg-transparent space-y-5 px-6 py-7 lg:px-7">
        <header className="space-y-3">
          <span className="inline-flex w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-text-secondary">
            {event.category.name}
          </span>
          <h2 className="break-words text-lg font-bold leading-6 text-ink">
            {event.title}
          </h2>
        </header>

        <p className="text-sm text-text-secondary">
          Modalidad: {event.modality.title}
        </p>
        <dl className="space-y-2 border-b border-border pb-4">
          <DetailRow
            icon={CalendarDays}
            label="Fecha"
            value={formatEventDate(event.eventDate)}
          />
          <DetailRow
            icon={Clock3}
            label="Horario"
            value={formatTimeRange(event.startTime, event.endTime)}
          />
          <DetailRow
            icon={MapPin}
            label={
              event.modality.title.toLowerCase() === 'virtual'
                ? 'Enlace'
                : 'Lugar'
            }
            value={event.location?.trim() || 'Por confirmar'}
          />
          <DetailRow
            icon={UserRound}
            label="Instructor"
            value={event.instructorName?.trim() || 'Por confirmar'}
          />
        </dl>

        <section
          aria-labelledby="event-description-title"
          className="space-y-2"
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide text-text-secondary"
            id="event-description-title"
          >
            Descripción
          </h3>
          <p className="whitespace-pre-line break-words text-sm leading-5 text-text-secondary">
            {event.description?.trim() || 'Descripción por confirmar.'}
          </p>
        </section>

        <section aria-labelledby="event-capacity-title" className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3
              className="text-xs font-semibold uppercase tracking-wide text-text-secondary"
              id="event-capacity-title"
            >
              Cupos
            </h3>
            <span className="text-xs font-semibold text-ink">
              {!hasValidCapacity
                ? 'Por confirmar'
                : capacity === null
                  ? `${enrolledCount} inscritos`
                  : `${enrolledCount} de ${capacity}`}
            </span>
          </div>
          {hasValidCapacity && progressPercentage !== null && (
            <div
              aria-label={`Ocupación del taller: ${progressPercentage}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progressPercentage}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
            >
              <div
                className={`h-full rounded-full transition-[width] ${isFull ? 'bg-accent' : 'bg-gold'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          <p
            id="event-capacity-description"
            aria-live="polite"
            className="text-xs text-text-secondary"
          >
            {!hasValidCapacity
              ? 'Información de cupos no disponible.'
              : capacity === null
                ? 'Sin límite de cupos'
                : isFull
                  ? 'Lleno · Sin cupos disponibles'
                  : `${availableSpots} cupos disponibles`}
          </p>
        </section>

        <Button
          aria-describedby="event-capacity-description"
          className="mt-2 min-h-11 w-full bg-accent text-white hover:bg-danger disabled:bg-muted disabled:text-text-secondary disabled:opacity-100"
          disabled={!hasValidCapacity || isFull}
          size="lg"
          type="button"
        >
          Inscribirme
        </Button>
      </Card>
    </aside>
  );
}

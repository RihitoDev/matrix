'use client';

import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import {
  calculateEventCapacityStatus,
  formatEventDate,
  formatTimeRange,
} from '../utils/event-card';
import type { EventCardProps } from '../types/event.types';

const categoryBadge = cva('text-xs font-semibold px-3 py-1 rounded-full', {
  variants: {
    category: {
      tecnologia: 'bg-slate-200/80 text-ink',
      'ia & datos': 'bg-amber-100/80 text-amber-800',
      diseno: 'bg-slate-200/80 text-ink',
      seguridad: 'bg-interaction text-danger',
      other: 'bg-slate-200/80 text-ink',
    },
  },
  defaultVariants: { category: 'other' },
});

export function EventCard({
  event,
  isSelected = false,
  onSelect,
}: EventCardProps) {
  const { enrolledCount, capacity, progressPercentage, isFull } =
    calculateEventCapacityStatus(event);

  const categoryName = event.category.name;
  const normalizedCategory = categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const category =
    normalizedCategory === 'tecnologia' ||
    normalizedCategory === 'ia & datos' ||
    normalizedCategory === 'diseno' ||
    normalizedCategory === 'seguridad'
      ? normalizedCategory
      : 'other';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(event);
    }
  };

  const handleKeyDown = (
    keyboardEvent: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card className="gap-0 border-0 bg-transparent p-0 shadow-none">
      <Button
        variant="ghost"
        type="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-auto w-full items-stretch whitespace-normal bg-surface border rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs transition-colors cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 hover:bg-blue-50'
            : 'border-border hover:border-border-strong',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={cn(categoryBadge({ category }))}>
            {categoryName}
          </span>

          {isFull && (
            <span
              data-testid="event-full-badge"
              className="text-xs font-semibold px-3 py-1 rounded-full bg-interaction text-danger"
            >
              Lleno
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <h2 className="text-base font-bold text-ink leading-snug">
            {event.title}
          </h2>

          <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{formatEventDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {progressPercentage === null ? (
            <span className="flex-1 text-xs text-text-secondary">
              Sin limite de cupos
            </span>
          ) : (
            <div
              role="progressbar"
              aria-label={`Cupos ocupados para ${event.title}`}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="flex-1 bg-slate-200/80 h-2 rounded-full overflow-hidden"
            >
              <div
                data-testid="event-capacity-bar"
                className={cn(
                  'h-full rounded-full transition-all',
                  isFull ? 'bg-accent' : 'bg-gold',
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          <span className="text-xs font-medium text-text-secondary shrink-0">
            {capacity === null
              ? `${enrolledCount} inscritos`
              : `${enrolledCount}/${capacity}`}
          </span>
        </div>
      </Button>
    </Card>
  );
}

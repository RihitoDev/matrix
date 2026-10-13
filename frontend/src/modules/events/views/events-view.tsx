'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { RequestFeedback } from '../components/request-feedback';
import { EventDetailState } from '../components/event-detail-state';
import { EventCard } from '../components/event-card';
import { EventDetailPanel } from '../components/event-detail-panel';
import { useEvent } from '../hooks/use-event';
import { useEvents } from '../hooks/use-events';
import { useEventsFilters } from '../hooks/use-events-filters';
import { useEventCategories } from '../../event-categories/hooks/use-event-categories';
import { EventsSearchInput } from '../components/events-search-input';
import { CategoryFilterChips } from '../../event-categories/components/category-filter-chips';
import type { EventItem } from '../types/event.types';

export function EventsView() {
  const { searchInput, setSearchInput, categoryId, setCategoryId, filters } =
    useEventsFilters();
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories,
  } = useEventCategories();
  const { events, error, hasMore, isLoading, isLoadingMore, loadMore, retry } =
    useEvents(filters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (selectedEvent: EventItem) => {
    setSelectedEventId(selectedEvent.id);
  };

  const detail = useEvent(selectedEventId);

  return (
    <div className="flex min-h-svh w-full flex-1 flex-col bg-surface-soft text-foreground lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 pb-8 pt-20 sm:px-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Talleres disponibles
          </h1>
          <p className="text-sm text-text-secondary">
            {events.length} talleres cargados
          </p>
        </header>

        <div
          role="search"
          aria-label="Filtros de talleres"
          className="flex flex-wrap items-center gap-2.5"
        >
          <EventsSearchInput value={searchInput} onChange={setSearchInput} />
          <CategoryFilterChips
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </div>

        {categoriesLoading && (
          <RequestFeedback message="Cargando categorías..." />
        )}
        {categoriesError && (
          <RequestFeedback
            message={categoriesError}
            isError
            onRetry={retryCategories}
            retryLabel="Reintentar categorías"
          />
        )}

        <section aria-label="Listado de talleres">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((eventItem) => (
              <EventCard
                key={eventItem.id}
                event={eventItem}
                isSelected={selectedEventId === eventItem.id}
                onSelect={handleSelectEvent}
              />
            ))}
          </div>
          {isLoading && events.length === 0 && (
            <p role="status" className="py-10 text-center text-text-secondary">
              Cargando talleres...
            </p>
          )}
          {!isLoading && !error && events.length === 0 && (
            <p className="py-10 text-center text-text-secondary">
              {filters.search.trim() || filters.categoryId
                ? 'No se encontraron talleres con esos filtros. Prueba otra búsqueda o categoría.'
                : 'No hay talleres disponibles.'}
            </p>
          )}
          {error && <RequestFeedback message={error} isError onRetry={retry} />}
          {hasMore && !error && (
            <div className="flex justify-center pt-6">
              <Button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-ink disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMore ? 'Cargando...' : 'Cargar más talleres'}
              </Button>
            </div>
          )}
        </section>
      </div>

      {detail.event ? (
        <EventDetailPanel event={detail.event} />
      ) : (
        <EventDetailState
          selectedId={selectedEventId}
          isLoading={detail.isLoading}
          error={detail.error}
          notFound={detail.notFound}
          retry={detail.retry}
        />
      )}
    </div>
  );
}

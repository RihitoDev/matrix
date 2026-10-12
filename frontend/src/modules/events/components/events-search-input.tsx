'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { EventsSearchInputProps } from '../types/events-search-input-props.types';

import { SEARCH_MAX_LENGTH } from '../constants/events.constants';

export function EventsSearchInput({ value, onChange }: EventsSearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar taller..."
        aria-label="Buscar taller"
        maxLength={SEARCH_MAX_LENGTH}
        className="h-10 rounded-full bg-surface pl-10 shadow-2xs"
      />
    </div>
  );
}

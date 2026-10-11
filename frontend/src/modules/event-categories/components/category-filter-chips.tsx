'use client';

import { Button } from '@/components/ui/button';
import type { CategoryFilterChipsProps } from '../types/category-filter-chips-props.types';

export function CategoryFilterChips({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="flex flex-wrap items-center gap-2"
    >
      <Button
        size="lg"
        variant={selectedId === null ? 'default' : 'outline'}
        aria-pressed={selectedId === null}
        onClick={() => onSelect(null)}
        className="rounded-full px-4 text-xs font-semibold"
      >
        Todos
      </Button>
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <Button
            key={category.id}
            size="lg"
            variant={isSelected ? 'default' : 'outline'}
            aria-pressed={isSelected}
            onClick={() => onSelect(category.id)}
            className="rounded-full px-4 text-xs font-semibold"
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}

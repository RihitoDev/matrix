import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { CategoryFilterChips } from './category-filter-chips';

afterEach(() => {
  cleanup();
});

const categories = [
  { id: '1', name: 'Tecnología' },
  { id: '2', name: 'IA & Datos' },
];

describe('CategoryFilterChips', () => {
  it('renders All and the available categories', () => {
    render(
      <CategoryFilterChips
        categories={categories}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Tecnología')).toBeInTheDocument();
    expect(screen.getByText('IA & Datos')).toBeInTheDocument();
  });

  it('keeps All selected by default', () => {
    render(
      <CategoryFilterChips
        categories={categories}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Todos')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('marks only the selected category as active', () => {
    render(
      <CategoryFilterChips
        categories={categories}
        selectedId="1"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Tecnología')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(screen.getByText('IA & Datos')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onSelect with the category id or null', () => {
    const handleSelect = vi.fn();

    render(
      <CategoryFilterChips
        categories={categories}
        selectedId={null}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText('Tecnología'));
    expect(handleSelect).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByText('Todos'));
    expect(handleSelect).toHaveBeenCalledWith(null);
  });
});
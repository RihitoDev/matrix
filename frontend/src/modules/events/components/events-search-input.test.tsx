import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { EventsSearchInput } from './events-search-input';

afterEach(() => {
  cleanup();
});

describe('EventsSearchInput', () => {
  it('muestra el valor y el placeholder correctamente', () => {
    render(
      <EventsSearchInput
        value="React"
        onChange={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar taller...');

    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('React');
  });

  it('llama a onChange cuando el usuario escribe', () => {
    const handleChange = vi.fn();

    render(
      <EventsSearchInput
        value=""
        onChange={handleChange}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar taller...');

    fireEvent.change(input, {
      target: { value: 'Data Science' },
    });

    expect(handleChange).toHaveBeenCalledWith('Data Science');
  });

  it('limita el buscador a 150 caracteres', () => {
    render(
      <EventsSearchInput
        value=""
        onChange={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText('Buscar taller...');

    expect(input).toHaveAttribute('maxlength', '150');
  });
});
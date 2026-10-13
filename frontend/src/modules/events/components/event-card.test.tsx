import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calculateEventCapacityStatus,
  formatEventDate,
  formatTimeRange,
} from '../utils/event-card';
import { EventCard } from './event-card';
import type { EventItem } from '../types/event.types';

const MOCK_EVENT: EventItem = {
  id: 'e1a2b3c4-0001-4000-8000-000000000001',
  title: 'Desarrollo Web con React',
  description: 'Taller practico de React.',
  category: { id: 'a1a1a1a1-0001-4000-8000-000000000001', name: 'Tecnologia' },
  instructorName: 'Ing. Carlos Mendoza',
  eventDate: '2026-10-15',
  startTime: '09:00:00',
  endTime: '13:00:00',
  location: 'Auditorio FCyT',
  capacity: 30,
  availableSpots: 6,
  registrationCount: 24,
  statusId: 'b1b1b1b1-0001-4000-8000-000000000001',
  modalityId: 'c1c1c1c1-0001-4000-8000-000000000001',
};

afterEach(() => {
  cleanup();
});

describe('EventCard y utilidades de formato', () => {
  it('calcula ocupacion desde el DTO GET /events', () => {
    expect(calculateEventCapacityStatus(MOCK_EVENT)).toEqual({
      enrolledCount: 24,
      capacity: 30,
      progressPercentage: 80,
      isFull: false,
    });
  });

  it('marca como lleno al llegar a la capacidad y limita el porcentaje a 100', () => {
    const fullEvent: EventItem = {
      ...MOCK_EVENT,
      availableSpots: 0,
      registrationCount: 32,
    };

    expect(calculateEventCapacityStatus(fullEvent)).toEqual({
      enrolledCount: 32,
      capacity: 30,
      progressPercentage: 100,
      isFull: true,
    });
  });

  it('trata capacidad null como cupos sin limite', () => {
    const unlimitedEvent: EventItem = {
      ...MOCK_EVENT,
      capacity: null,
      availableSpots: null,
    };

    expect(calculateEventCapacityStatus(unlimitedEvent)).toEqual({
      enrolledCount: 24,
      capacity: null,
      progressPercentage: null,
      isFull: false,
    });
  });

  it('formatea correctamente fechas validas y retorna el valor original si es invalido', () => {
    expect(formatEventDate('2026-10-15')).toContain('15');
    expect(formatEventDate('fecha-invalida')).toBe('fecha-invalida');
  });

  it('formatea correctamente rangos de hora con o sin segundos', () => {
    expect(formatTimeRange('09:00:00', '13:00:00')).toBe('09:00 - 13:00');
    expect(formatTimeRange('inicio', 'fin')).toBe('inicio - fin');
  });

  it('renderiza el titulo, categoria, fecha, horario y relacion de cupos', () => {
    render(<EventCard event={MOCK_EVENT} />);

    expect(
      screen.getByRole('heading', { name: 'Desarrollo Web con React' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 13:00')).toBeInTheDocument();
    expect(screen.getByText('24/30')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });

  it('aplica estilo por defecto para categorias no mapeadas y estado seleccionado', () => {
    const customCategoryEvent: EventItem = {
      ...MOCK_EVENT,
      category: {
        id: 'a1a1a1a1-0099-4000-8000-000000000099',
        name: 'Robotica',
      },
    };

    render(<EventCard event={customCategoryEvent} isSelected />);

    const cardButton = screen.getByRole('button', {
      name: /desarrollo web con react/i,
    });
    expect(cardButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Robotica')).toBeInTheDocument();
  });

  it('ejecuta el callback onSelect al hacer clic y al presionar Enter o Espacio', () => {
    const handleSelect = vi.fn();
    render(<EventCard event={MOCK_EVENT} onSelect={handleSelect} />);

    const cardButton = screen.getByRole('button', {
      name: /desarrollo web con react/i,
    });

    fireEvent.click(cardButton);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(MOCK_EVENT);

    fireEvent.keyDown(cardButton, { key: 'Enter' });
    expect(handleSelect).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(cardButton, { key: ' ' });
    expect(handleSelect).toHaveBeenCalledTimes(3);
    fireEvent.keyDown(cardButton, { key: 'Escape' });
    expect(handleSelect).toHaveBeenCalledTimes(3);
  });

  it('muestra cupos ilimitados sin dividir por capacidad nula', () => {
    const unlimitedEvent: EventItem = {
      ...MOCK_EVENT,
      capacity: null,
      availableSpots: null,
    };

    render(<EventCard event={unlimitedEvent} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Sin limite de cupos')).toBeInTheDocument();
    expect(screen.getByText('24 inscritos')).toBeInTheDocument();
  });

  it('muestra el estado lleno y una barra completa para un evento sin cupos disponibles', () => {
    const fullEvent: EventItem = {
      ...MOCK_EVENT,
      availableSpots: 0,
      registrationCount: 30,
    };

    render(<EventCard event={fullEvent} />);

    expect(screen.getByTestId('event-full-badge')).toHaveTextContent('Lleno');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByTestId('event-capacity-bar')).toHaveStyle({
      width: '100%',
    });
  });
});

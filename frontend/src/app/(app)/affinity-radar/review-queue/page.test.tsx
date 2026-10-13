import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ColaRevisionPage from "./page";

vi.mock("@/modules/radar-chart/components/epic3-shell", () => ({
  Epic3Shell: ({ children }: { children: ReactNode }) => children,
}));

afterEach(() => {
  cleanup();
});

describe('ColaRevisionPage', () => {
  it('renderiza el layout principal de la cola de revisión', () => {
    render(<ColaRevisionPage />)

    expect(
      screen.getByRole('heading', { name: 'Cola de Revisión' }),
    ).toBeDefined()

    expect(
      screen.getByRole('heading', { name: 'Perfiles enviados' }),
    ).toBeDefined()

    expect(
      screen.getByRole('heading', { name: 'Detalle del perfil' }),
    ).toBeDefined()
  })

  it('muestra las cuatro pestañas de filtrado', () => {
    render(<ColaRevisionPage />)

    expect(screen.getByRole('button', { name: 'Todos' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Completado' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Procesando' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Pendiente' })).toBeDefined()
  })

  it('muestra todos los perfiles inicialmente', () => {
    render(<ColaRevisionPage />)

    expect(screen.getByText('Ana Martínez')).toBeDefined()
    expect(screen.getByText('Carlos Rodríguez')).toBeDefined()
    expect(screen.getByText('María López')).toBeDefined()
    expect(screen.getByText('Diego Fernández')).toBeDefined()
    expect(screen.getByText('Mostrando 4 perfil(es)')).toBeDefined()
  })

  it('filtra los perfiles completados', () => {
    render(<ColaRevisionPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Completado' }),
    )

    expect(screen.getByText('Ana Martínez')).toBeDefined()
    expect(screen.queryByText('Carlos Rodríguez')).toBeNull()
    expect(screen.queryByText('María López')).toBeNull()
    expect(screen.queryByText('Diego Fernández')).toBeNull()
    expect(screen.getByText('Mostrando 1 perfil(es)')).toBeDefined()
  })

  it('filtra los perfiles en procesamiento', () => {
    render(<ColaRevisionPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Procesando' }),
    )

    expect(screen.getByText('Carlos Rodríguez')).toBeDefined()
    expect(screen.queryByText('Ana Martínez')).toBeNull()
    expect(screen.queryByText('María López')).toBeNull()
    expect(screen.queryByText('Diego Fernández')).toBeNull()
    expect(screen.getByText('Mostrando 1 perfil(es)')).toBeDefined()
  })

  it('filtra los perfiles pendientes', () => {
    render(<ColaRevisionPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Pendiente' }),
    )

    expect(screen.getByText('María López')).toBeDefined()
    expect(screen.getByText('Diego Fernández')).toBeDefined()
    expect(screen.queryByText('Ana Martínez')).toBeNull()
    expect(screen.queryByText('Carlos Rodríguez')).toBeNull()
    expect(screen.getByText('Mostrando 2 perfil(es)')).toBeDefined()
  })

  it('permite volver al filtro Todos', () => {
    render(<ColaRevisionPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Pendiente' }),
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Todos' }),
    )

    expect(screen.getByText('Ana Martínez')).toBeDefined()
    expect(screen.getByText('Carlos Rodríguez')).toBeDefined()
    expect(screen.getByText('María López')).toBeDefined()
    expect(screen.getByText('Diego Fernández')).toBeDefined()
    expect(screen.getByText('Mostrando 4 perfil(es)')).toBeDefined()
  })
})
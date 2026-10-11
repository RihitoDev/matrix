import { describe, test, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ContactSearchModal } from '../components/contact-search-modal';
import { useContactSearch } from '../hooks/use-contact-search';

expect.extend(matchers);

vi.mock('../hooks/use-contact-search', () => ({
  useContactSearch: vi.fn(),
}));

const mockUsers = [
  { id: '1', fullName: 'Maria Peredo', headline: 'Senior Developer', role: 'MENTOR', avatarUrl: null, isActive: true },
  { id: '2', fullName: 'Mario Alcocer', headline: 'Cloud Architect', role: 'STUDENT', avatarUrl: null, isActive: true },
];

describe('ContactSearchModal - Task HU-2 (Navegación y Estados Visuales)', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectContact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Soporte para scrollIntoView en el entorno virtual JSDOM
    if (typeof window.HTMLElement !== 'undefined') {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }
  });

  afterEach(() => {
    cleanup();
  });

  test('debe cumplir con la navegación por teclado (ArrowDown, ArrowUp y Enter)', () => {
    (useContactSearch as Mock).mockReturnValue({
      results: mockUsers,
      isSearching: false,
    });

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por nombre...');

    // 1. Navegar hacia abajo
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    // 2. Navegar al segundo elemento
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');

    // 3. Seleccionar con la tecla Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSelectContact).toHaveBeenCalledWith(mockUsers[1]);
  });

  test('debe cambiar el índice seleccionado al hacer hover con el mouse', () => {
    (useContactSearch as Mock).mockReturnValue({
      results: mockUsers,
      isSearching: false,
    });

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    const options = screen.getAllByRole('option');
    fireEvent.mouseEnter(options[1]);

    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  test('debe mostrar el indicador visual de carga cuando isSearching es true', () => {
    (useContactSearch as Mock).mockReturnValue({
      results: [],
      isSearching: true,
    });

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Buscando...');
  });

  test('debe mostrar el mensaje adecuado cuando no existen coincidencias de búsqueda', () => {
    (useContactSearch as Mock).mockReturnValue({
      results: [],
      isSearching: false,
    });

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'Carlos Inexistente' } });

    expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
  });
});
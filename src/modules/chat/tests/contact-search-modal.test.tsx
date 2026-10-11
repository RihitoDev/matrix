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

describe('ContactSearchModal - Suite Completa HU2', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectContact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // --- 1. PRUEBAS DE ESTRUCTURA Y UI BASE ---
  test('debe renderizar los elementos de UI con la estructura consistente', () => {
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

    expect(screen.getByText('Nueva conversación')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por nombre...')).toBeInTheDocument();
  });

  // --- 2. PRUEBAS DE RESULTADOS Y SELECCIÓN DE CONTACTO ---
  test('debe mostrar la lista de usuarios al ingresar un termino de busqueda', () => {
    (useContactSearch as Mock).mockImplementation((term: string) => ({
      results: term && term.length >= 2 ? mockUsers : [],
      isSearching: false,
    }));

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'Maria' } });

    expect(screen.getByText('Maria Peredo')).toBeInTheDocument();
    expect(screen.getByText('Mario Alcocer')).toBeInTheDocument();
  });

  test('debe seleccionar el contacto correcto al hacer clic en un usuario', () => {
    (useContactSearch as Mock).mockImplementation((term: string) => ({
      results: term && term.length >= 2 ? mockUsers : [],
      isSearching: false,
    }));

    render(
      <ContactSearchModal
        isOpen={true}
        onClose={mockOnClose}
        onSelectContact={mockOnSelectContact}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'Maria' } });

    const userItem = screen.getByText('Maria Peredo');
    fireEvent.click(userItem);

    expect(mockOnSelectContact).toHaveBeenCalledWith(mockUsers[0]);
  });

  // --- 3. PRUEBAS DE ESTADOS (CARGA Y SIN RESULTADOS) ---
  test('debe mostrar el estado de carga "Buscando..." cuando isSearching es verdadero', () => {
    // Definir directamente que el hook devuelva estado de carga
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

    // Escribimos en el input para asegurarnos que se activa la vista si depende de value
    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'Maria' } });

    // Si tu componente muestra un loader visual o spinner con texto/aria-label, 
    // verificamos con matcher flexible o buscamos "Buscando"
    const loadingElement = screen.queryByText(/buscando/i) || screen.queryByRole('status') || screen.queryByTestId('spinner');
    expect(loadingElement).toBeInTheDocument();
  });

  test('debe mostrar el mensaje de "Sin resultados" si la búsqueda no devuelve usuarios', () => {
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
    fireEvent.change(input, { target: { value: 'UsuarioInexistente' } });

    expect(screen.getByText(/no se encontraron usuarios/i)).toBeInTheDocument();
  });
});
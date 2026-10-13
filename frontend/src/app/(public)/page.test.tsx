import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiClient } from '@/shared/services/api-client'
import Home from './page'

describe('Home Page', () => {
  afterEach(() => {

    cleanup()
    vi.restoreAllMocks()
  })

  it('renderiza la nueva interfaz de inicio con la tarjeta de habilidades', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { data: 'Mock response' },
    })

    render(<Home />)

    expect(screen.getByText('UMSSY')).toBeDefined()
    expect(screen.getByText('Habilidades detectadas automáticamente')).toBeDefined()
    expect(screen.getByText('Python')).toBeDefined()
    expect(screen.getByText('Django')).toBeDefined()
  })

  it('renderiza la vista correctamente incluso si la petición de fondo falla', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network error'))

    render(<Home />)


    await waitFor(() => {
      expect(screen.getByText('UMSSY')).toBeDefined()
      expect(screen.getByText('Habilidades detectadas automáticamente')).toBeDefined()
    })
  })
})

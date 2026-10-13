import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiClient } from '@/shared/services/api-client'
import Home from './page'

describe('Home Page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza el título principal y muestra la respuesta GET del backend via Axios', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        statusCode: 200,
        data: 'Hello World!',
        detail: 'Solicitud procesada correctamente',
        ok: true,
      },
    })

    render(<Home />)
    expect(screen.getByText('UMSSY')).toBeDefined()

    await waitFor(() => {
      expect(screen.getByText('Hello World!')).toBeDefined()
    })
  })

  it('muestra mensaje de error si falla la petición con Axios', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'))

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('Error connecting to backend')).toBeDefined()
    })
  })
})
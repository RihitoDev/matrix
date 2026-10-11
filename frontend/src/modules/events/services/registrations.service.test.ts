// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/services/api-client';
import { registrationsService } from './registrations.service';

vi.mock('@/shared/services/api-client', () => ({
  apiClient: { defaults: { baseURL: 'http://localhost/api' }, get: vi.fn() },
}));

describe('registrationsService', () => {
  beforeEach(() => {
    apiClient.defaults.baseURL = 'http://localhost/api';
    const values = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    vi.clearAllMocks();
  });
  it('envía el token de sesión y devuelve las inscripciones del backend', async () => {
    sessionStorage.setItem('accessToken', 'signed-token');
    const items = [
      {
        id: 'registration-1',
        eventName: 'React',
        date: '2026-10-20',
        startTime: '09:00',
        endTime: '12:00',
        location: 'Aula 101',
        status: 'Confirmada',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: items } });
    const signal = new AbortController().signal;
    await expect(registrationsService.getMine(signal)).resolves.toEqual(items);
    expect(apiClient.get).toHaveBeenCalledWith('/event-registrations/me', {
      headers: { Authorization: 'Bearer signed-token' },
      signal,
      timeout: 10000,
    });
  });
  it('rechaza la URL ausente sin enviar la solicitud', async () => {
    sessionStorage.setItem('accessToken', 'token');
    apiClient.defaults.baseURL = undefined;
    await expect(registrationsService.getMine()).rejects.toThrow(
      'URL del backend',
    );
    expect(apiClient.get).not.toHaveBeenCalled();
  });
  it('no consulta sin sesión', async () => {
    await expect(registrationsService.getMine()).rejects.toThrow(
      'Debes iniciar sesión',
    );
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

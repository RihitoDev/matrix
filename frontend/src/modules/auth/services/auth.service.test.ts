// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/services/api-client';
import { authService } from './auth.service';
vi.mock('@/shared/services/api-client', () => ({ apiClient: { defaults: { baseURL: 'http://localhost:8080/api' }, post: vi.fn() } }));
const payload = { email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' as const };
beforeEach(() => { vi.clearAllMocks(); apiClient.defaults.baseURL = 'http://localhost:8080/api'; });
describe('authService', () => {
  it('propaga errores de red del backend', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));
    await expect(authService.login(payload)).rejects.toThrow('Network error');
  });
  it('extrae el token de la respuesta real del backend', async () => {
    const session = { accessToken: 'token', roleTag: 'titulado' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: { statusCode: 201, data: session, detail: 'Solicitud procesada correctamente', ok: true } });
    await expect(authService.login(payload)).resolves.toEqual(session);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
  });
  it('rechaza configuración ausente sin enviar credenciales', async () => {
    apiClient.defaults.baseURL = undefined;
    await expect(authService.login(payload)).rejects.toThrow('URL del backend');
    expect(apiClient.post).not.toHaveBeenCalled();
  });
  it.each([null, {}])('rechaza una respuesta sin token: %s', async (data) => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data } });
    await expect(authService.login(payload)).rejects.toThrow('token de sesión válido');
  });
});

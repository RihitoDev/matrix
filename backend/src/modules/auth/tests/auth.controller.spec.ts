import { describe, expect, it, vi } from 'vitest';
import { AuthController } from '../controllers/auth.controller.js';

describe('AuthController', () => {
  it('delega el login al servicio con el cuerpo recibido', async () => {
    const authService = { login: vi.fn().mockResolvedValue({ accessToken: 'token', roleTag: 'titulado' }) };
    const controller = new AuthController(authService as any);

    const body = { email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' as const };
    const result = await controller.login(body);

    expect(authService.login).toHaveBeenCalledWith(body);
    expect(result).toEqual({ accessToken: 'token', roleTag: 'titulado' });
  });
  it('delegates session readback with the identity verified by the guard', () => {
    const user = { id: 'u-1', email: 'user@test.com', roles: ['titulado', 'mentor'] };
    const authService = { getSession: vi.fn().mockReturnValue(user) };
    const controller = new AuthController(authService as any);
    expect(controller.getSession(user)).toEqual(user);
    expect(authService.getSession).toHaveBeenCalledWith(user);
  });

});
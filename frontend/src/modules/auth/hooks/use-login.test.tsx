import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '../services/auth.service';
import { useLogin } from './use-login';

vi.mock('../services/auth.service', () => ({ authService: { login: vi.fn() } }));
const login = vi.mocked(authService.login);
const payload = { email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' as const };
beforeEach(() => login.mockReset());
afterEach(cleanup);
describe('useLogin', () => {
  it('expone carga y devuelve la sesión autenticada', async () => {
    let resolve!: (value: { accessToken: string; roleTag: 'titulado' }) => void;
    login.mockReturnValue(new Promise((res) => { resolve = res; }));
    const { result } = renderHook(useLogin);
    let pending!: ReturnType<typeof result.current.login>;
    act(() => { pending = result.current.login(payload); });
    expect(result.current.isLoading).toBe(true);
    const session = { accessToken: 'token', roleTag: 'titulado' as const };
    await act(async () => { resolve(session); expect(await pending).toEqual(session); });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  it.each([
    [{ isAxiosError: true }, 'No se pudo conectar'],
    [{ isAxiosError: true, response: { status: 500 } }, 'El backend falló'],
    [{ isAxiosError: true, response: { status: 401, data: { detail: 'Credenciales incorrectas' } } }, 'Credenciales incorrectas'],
    [{ isAxiosError: true, response: { status: 400, data: {} } }, 'Revisa el correo'],
    [{ isAxiosError: true, response: { status: 400 } }, 'Revisa el correo'],
    [new Error('Configuración ausente'), 'Configuración ausente'],
    ['unknown', 'No se pudo iniciar sesión'],
  ])('informa la causa y libera la carga: %s', async (cause, message) => {
    login.mockRejectedValueOnce(cause).mockResolvedValueOnce({ accessToken: 'token', roleTag: 'titulado' });
    const { result } = renderHook(useLogin);
    await act(async () => { expect(await result.current.login(payload)).toBeNull(); });
    expect(result.current.error).toContain(message);
    expect(result.current.isLoading).toBe(false);
    await act(async () => { await result.current.login(payload); });
    expect(result.current.error).toBeNull();
  });
});

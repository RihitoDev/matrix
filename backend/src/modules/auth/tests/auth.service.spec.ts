import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service.js';
import { InvalidCredentialsException, RoleNotAssignedException } from '../exceptions/index.js';

describe('AuthService', () => {
  const authRepository = { findUserByEmailWithRoles: vi.fn(), existsByEmail: vi.fn() };
  const jwtService = { sign: vi.fn() };
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(authRepository as any, jwtService as any);
  });

  it.each([true, false])('existsByEmail delega en el repository y devuelve %s', async (exists) => {
    authRepository.existsByEmail.mockResolvedValue(exists);

    await expect(service.existsByEmail('ana@umss.edu.bo')).resolves.toBe(exists);
    expect(authRepository.existsByEmail).toHaveBeenCalledWith('ana@umss.edu.bo');
  });

  it('lanza InvalidCredentialsException si el usuario no existe', async () => {
    authRepository.findUserByEmailWithRoles.mockResolvedValue(null);
    await expect(
      service.login({ email: 'no-existe@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('lanza InvalidCredentialsException si el usuario no tiene password', async () => {
    authRepository.findUserByEmailWithRoles.mockResolvedValue({ id: '1', password: null, roles: [] });
    await expect(
      service.login({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('lanza InvalidCredentialsException si la contrasena no coincide', async () => {
    const password = await bcrypt.hash('otra-contrasena', 10);
    authRepository.findUserByEmailWithRoles.mockResolvedValue({
      id: '1', password, roles: [{ role: { name: 'titulado' } }],
    });
    await expect(
      service.login({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('lanza RoleNotAssignedException si el usuario no tiene el rol solicitado', async () => {
    const password = await bcrypt.hash('Prueba123', 10);
    authRepository.findUserByEmailWithRoles.mockResolvedValue({
      id: '1', password, roles: [{ role: { name: 'mentor' } }],
    });
    await expect(
      service.login({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' }),
    ).rejects.toBeInstanceOf(RoleNotAssignedException);
  });

  it('devuelve el accessToken y el roleTag cuando todo es correcto', async () => {
    const password = await bcrypt.hash('Prueba123', 10);
    authRepository.findUserByEmailWithRoles.mockResolvedValue({
      id: 'user-1', password, roles: [{ role: { name: 'titulado' } }],
    });
    jwtService.sign.mockReturnValue('token-firmado');

    const result = await service.login({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' });

    expect(result).toEqual({ accessToken: 'token-firmado', roleTag: 'titulado' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1', roleTag: 'titulado' });
  });
});
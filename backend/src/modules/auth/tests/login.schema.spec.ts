import { describe, expect, it } from 'vitest';
import { loginSchema } from '../requests/login.schema.js';

describe('loginSchema', () => {
  it('accepts credentials without a selected role', () => {
    expect(loginSchema.safeParse({ email: 'ana@umss.edu.bo', password: 'Prueba123' }).success).toBe(true);
  });
  it('acepta un payload valido', () => {
    expect(loginSchema.safeParse({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'titulado' }).success).toBe(true);
  });

  it('rechaza un correo invalido', () => {
    expect(loginSchema.safeParse({ email: 'no-es-un-correo', password: 'Prueba123', roleTag: 'titulado' }).success).toBe(false);
  });

  it('rechaza una contrasena muy corta', () => {
    expect(loginSchema.safeParse({ email: 'prueba@umss.edu.bo', password: '123', roleTag: 'titulado' }).success).toBe(false);
  });

  it('rechaza un roleTag que no existe', () => {
    expect(loginSchema.safeParse({ email: 'prueba@umss.edu.bo', password: 'Prueba123', roleTag: 'inexistente' }).success).toBe(false);
  });
});
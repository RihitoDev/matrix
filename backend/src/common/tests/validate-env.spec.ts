import { describe, expect, it } from 'vitest';
import { validateEnv } from '../utils/validate-env.js';

const validEnv = {
  JWT_SECRET: 'secret',
  JWT_EXPIRES_IN: '8h',
  JWT_ALGORITHM: 'HS256',
  CORS_ORIGIN: 'http://localhost:3000',
};

describe('validateEnv', () => {
  it('no lanza cuando todas las variables estan definidas', () => {
    expect(() => validateEnv(validEnv)).not.toThrow();
  });

  it.each(['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_ALGORITHM', 'CORS_ORIGIN'])(
    'lanza un error que nombra %s cuando falta',
    (name) => {
      const env = { ...validEnv, [name]: undefined };
      expect(() => validateEnv(env)).toThrow(name);
    },
  );

  it('trata valores vacios o con solo espacios como faltantes', () => {
    expect(() => validateEnv({ ...validEnv, JWT_EXPIRES_IN: '', CORS_ORIGIN: '  ' })).toThrow(
      'JWT_EXPIRES_IN, CORS_ORIGIN',
    );
  });

  it('lista todas las variables faltantes en un solo mensaje', () => {
    expect(() => validateEnv({})).toThrow(
      'JWT_SECRET, JWT_EXPIRES_IN, JWT_ALGORITHM, CORS_ORIGIN',
    );
  });
});

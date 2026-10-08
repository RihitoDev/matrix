import { describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createJobOfferSchema } from '../create-job-offer.schema.js';

const validBody = {
  tituloPuesto: 'Desarrollador de Sistemas Júnior',
  descripcion: 'Buscamos un desarrollador.\n- Node\n- SQL',
  modalidad: 'Remoto',
  ubicacion: 'Cochabamba, Bolivia',
  tipoContrato: 'Tiempo completo',
  categoria: 'Tecnología',
  numeroVacantes: 2,
  salarioMin: 6500,
  salarioMax: 8000,
  idiomas: 'Español, Inglés',
  enlaceGoogleMaps: 'https://maps.google.com/?q=Cochabamba',
  tecnologias: [randomUUID(), randomUUID()],
};

const parse = (overrides: Record<string, unknown>) =>
  createJobOfferSchema.safeParse({ ...validBody, ...overrides });

describe('createJobOfferSchema', () => {
  it('acepta una vacante válida', () => {
    expect(parse({}).success).toBe(true);
  });

  it('acepta un salario fijo sin máximo', () => {
    expect(parse({ salarioMax: undefined }).success).toBe(true);
  });

  it('rechaza un título de más de 60 caracteres', () => {
    expect(parse({ tituloPuesto: 'a'.repeat(61) }).success).toBe(false);
  });

  it('rechaza caracteres especiales en el título', () => {
    expect(parse({ tituloPuesto: 'Dev @ Senior' }).success).toBe(false);
  });

  it('rechaza un título con solo espacios', () => {
    expect(parse({ tituloPuesto: '     ' }).success).toBe(false);
  });

  it('rechaza una modalidad que no está en la lista', () => {
    expect(parse({ modalidad: 'Mixto' }).success).toBe(false);
  });

  it('rechaza 0 y más de 500 vacantes', () => {
    expect(parse({ numeroVacantes: 0 }).success).toBe(false);
    expect(parse({ numeroVacantes: 501 }).success).toBe(false);
  });

  it('rechaza un enlace que no es de Google Maps', () => {
    expect(
      parse({ enlaceGoogleMaps: 'https://ejemplo.com/mapa' }).success,
    ).toBe(false);
  });

  it('rechaza idiomas vacíos o de más de 100 caracteres', () => {
    expect(parse({ idiomas: '   ' }).success).toBe(false);
    expect(parse({ idiomas: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rechaza una descripción de más de 3000 caracteres', () => {
    expect(parse({ descripcion: 'a'.repeat(3001) }).success).toBe(false);
  });

  it('rechaza salario mínimo mayor al máximo', () => {
    expect(parse({ salarioMin: 9000, salarioMax: 8000 }).success).toBe(false);
  });

  it('rechaza una lista de tecnologías vacía o con más de 10', () => {
    expect(parse({ tecnologias: [] }).success).toBe(false);
    const muchas = Array.from({ length: 11 }, () => randomUUID());
    expect(parse({ tecnologias: muchas }).success).toBe(false);
  });
});
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createJobOfferSchema } from '../requests/create-job-offer.request.js';

const VALID_REQUEST = {
  title: 'DevOps Senior',
  description: 'Buscamos un perfil DevOps con Docker y Kubernetes.',
  modality: 'Híbrido',
  contractType: 'Tiempo completo',
  category: 'Tecnología',
  positionsAvailable: 2,
  salaryMin: 6500,
  salaryMax: 8000,
  languages: 'Español, inglés intermedio',
  locationUrl: 'https://maps.google.com/?q=Cochabamba',
  skillIds: [randomUUID()],
};

function parse(overrides: Record<string, unknown>) {
  return createJobOfferSchema.safeParse({ ...VALID_REQUEST, ...overrides });
}

function firstMessage(overrides: Record<string, unknown>) {
  const result = parse(overrides);
  return result.success ? undefined : result.error.issues[0].message;
}

describe('createJobOfferSchema', () => {
  it('acepta una vacante válida', () => {
    expect(parse({}).success).toBe(true);
  });

  it('acepta un salario fijo sin máximo', () => {
    expect(parse({ salaryMax: undefined }).success).toBe(true);
  });

  it('recorta los espacios de los textos', () => {
    const result = createJobOfferSchema.parse({ ...VALID_REQUEST, title: '  DevOps  ' });

    expect(result.title).toBe('DevOps');
  });

  it('exige los textos obligatorios aunque solo tengan espacios', () => {
    for (const field of ['title', 'description', 'category', 'languages', 'locationUrl']) {
      expect(firstMessage({ [field]: '   ' })).toBe('Este campo es obligatorio');
    }
  });

  it('valida el título: longitud y caracteres', () => {
    expect(firstMessage({ title: 'a'.repeat(61) })).toMatch(/60/);
    expect(firstMessage({ title: 'Dev@' })).toMatch(/alfanumericos/);
    expect(parse({ title: 'Ingeniero Peña' }).success).toBe(true);
  });

  it('limita la descripción y los idiomas', () => {
    expect(firstMessage({ description: 'a'.repeat(3001) })).toMatch(/3000/);
    expect(firstMessage({ languages: 'a'.repeat(101) })).toMatch(/100/);
  });

  it('solo acepta las modalidades y tipos de contrato del catálogo', () => {
    expect(firstMessage({ modality: 'Hibrido' })).toBe('Modalidad invalida');
    expect(firstMessage({ contractType: 'Pasantia' })).toBe('Tipo de contrato invalido');
    expect(parse({ modality: 'Remoto', contractType: 'Pasantía' }).success).toBe(true);
  });

  it('exige entre 1 y 500 vacantes enteras', () => {
    expect(firstMessage({ positionsAvailable: 0 })).toBe('Debe ser al menos 1');
    expect(firstMessage({ positionsAvailable: 501 })).toMatch(/500/);
    expect(firstMessage({ positionsAvailable: 1.5 })).toBe('Debe ser un numero entero');
  });

  it('exige un salario mayor a 0 y un rango ordenado', () => {
    expect(firstMessage({ salaryMin: 0 })).toBe('El salario debe ser mayor a 0');
    expect(firstMessage({ salaryMin: 9000, salaryMax: 8000 })).toBe(
      'El salario minimo no puede ser mayor al salario maximo',
    );
  });

  it('acepta los enlaces oficiales de Google Maps y rechaza otros', () => {
    for (const locationUrl of [
      'https://maps.google.com/?q=x',
      'https://www.google.com/maps/place/x',
      'https://goo.gl/maps/abc',
      'https://maps.app.goo.gl/abc',
    ]) {
      expect(parse({ locationUrl }).success).toBe(true);
    }
    expect(firstMessage({ locationUrl: 'https://ejemplo.com' })).toBe(
      'Ingresa un enlace valido de Google Maps',
    );
    expect(firstMessage({ locationUrl: 'http://maps.google.com/?q=x' })).toBe(
      'Ingresa un enlace valido de Google Maps',
    );
  });

  it('exige entre 1 y 10 habilidades con identificadores válidos', () => {
    expect(firstMessage({ skillIds: [] })).toBe('Debes seleccionar al menos una habilidad requerida');
    expect(firstMessage({ skillIds: Array.from({ length: 11 }, () => randomUUID()) })).toMatch(/10/);
    expect(firstMessage({ skillIds: ['Docker'] })).toBe('El identificador de la habilidad no es valido');
  });
});

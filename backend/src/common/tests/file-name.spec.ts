import { buildExportFileName, toFileNameSegment } from '../utils/file-name.js';

describe('toFileNameSegment', () => {
  it('quita tildes, pasa a minúsculas y reemplaza espacios por guiones', () => {
    expect(toFileNameSegment('Juan Pérez')).toBe('juan-perez');
  });

  it('conserva correos legibles', () => {
    expect(toFileNameSegment('Juan.Perez@gmail.com')).toBe(
      'juan.perez@gmail.com',
    );
  });

  it('elimina caracteres no válidos para nombres de archivo', () => {
    expect(toFileNameSegment(' a/b\\c"d;e* ')).toBe('a-b-c-d-e');
  });

  it('recorta textos demasiado largos', () => {
    expect(toFileNameSegment('a'.repeat(80))).toHaveLength(50);
  });
});

describe('buildExportFileName', () => {
  it('incluye los filtros usados entre el prefijo y la fecha', () => {
    expect(
      buildExportFileName(
        'usuarios-registrados',
        ['Estudiante', undefined, 'Juan'],
        '2026-10-04',
        'csv',
      ),
    ).toBe('usuarios-registrados-estudiante-juan-2026-10-04.csv');
  });

  it('omite los filtros vacíos o sin caracteres válidos', () => {
    expect(
      buildExportFileName(
        'usuarios-rechazados',
        ['', '***'],
        '2026-10-04',
        'csv',
      ),
    ).toBe('usuarios-rechazados-2026-10-04.csv');
  });
});

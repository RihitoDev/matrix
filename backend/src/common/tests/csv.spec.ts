import { buildCsv, CSV_BOM } from '../utils/csv.js';

describe('buildCsv', () => {
  it('genera encabezados y filas separadas por coma con BOM UTF-8', () => {
    const csv = buildCsv(
      ['Nombre', 'Correo'],
      [['Ana Pérez', 'ana@example.com']],
    );

    expect(csv).toBe(
      `${CSV_BOM}Nombre,Correo\r\nAna Pérez,ana@example.com\r\n`,
    );
  });

  it('encierra en comillas los valores con comas, comillas o saltos de línea', () => {
    const csv = buildCsv(
      ['Dato'],
      [['a,b'], ['dice "hola"'], ['línea\nnueva']],
    );

    expect(csv).toBe(
      `${CSV_BOM}Dato\r\n"a,b"\r\n"dice ""hola"""\r\n"línea\nnueva"\r\n`,
    );
  });

  it.each(['=SUMA(A1)', '+591', '-1', '@usuario'])(
    'neutraliza el valor %s para que Excel no lo ejecute como fórmula',
    (value) => {
      const csv = buildCsv(['Dato'], [[value]]);

      expect(csv).toBe(`${CSV_BOM}Dato\r\n'${value}\r\n`);
    },
  );

  it('solo incluye los encabezados cuando no hay filas', () => {
    expect(buildCsv(['A', 'B'], [])).toBe(`${CSV_BOM}A,B\r\n`);
  });
});

import { paginate, paginationSchema } from '../utils/pagination.js';

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('devuelve la porción de la página pedida', () => {
    expect(paginate(items, 2, 2)).toEqual({
      items: [3, 4],
      totalItems: 5,
      totalPages: 3,
      page: 2,
      limit: 2,
    });
  });

  it('devuelve una lista vacía si la página no existe', () => {
    expect(paginate(items, 4, 2).items).toEqual([]);
  });

  it.each([
    { total: 0, expectedPages: 0 },
    { total: 1, expectedPages: 1 },
    { total: 10, expectedPages: 1 },
    { total: 11, expectedPages: 2 },
    { total: 20, expectedPages: 2 },
    { total: 21, expectedPages: 3 },
  ])(
    'calcula $expectedPages páginas para $total registros en lotes de 10',
    ({ total, expectedPages }) => {
      const result = paginate(Array.from({ length: total }), 1, 10);

      expect(result.totalPages).toBe(expectedPages);
    },
  );
});

describe('paginationSchema', () => {
  it('aplica valores por defecto y rechaza límites fuera de rango', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 10 });
    expect(paginationSchema.safeParse({ limit: '500' }).success).toBe(false);
  });
});

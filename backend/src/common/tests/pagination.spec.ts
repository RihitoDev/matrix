import { paginate, paginationSchema } from '../utils/pagination.js';

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5];

  it('devuelve la porción de la página pedida', () => {
    expect(paginate(items, 2, 2)).toEqual({
      items: [3, 4],
      totalItems: 5,
      page: 2,
      limit: 2,
    });
  });

  it('devuelve una lista vacía si la página no existe', () => {
    expect(paginate(items, 4, 2).items).toEqual([]);
  });
});

describe('paginationSchema', () => {
  it('aplica valores por defecto y rechaza límites fuera de rango', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 10 });
    expect(paginationSchema.safeParse({ limit: '500' }).success).toBe(false);
  });
});

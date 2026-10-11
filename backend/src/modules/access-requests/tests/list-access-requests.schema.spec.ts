import { describe, expect, it } from 'vitest';
import { listAccessRequestsQuerySchema } from '../requests/list-access-requests.schema.js';
import { MAX_PAGE_SIZE } from '../constants/list-access-requests.constants.js';

const messagesOf = (input: unknown) => {
  const result = listAccessRequestsQuerySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
};

describe('listAccessRequestsQuerySchema', () => {
  it('usa página 1 y 10 por página por defecto y no exige estado', () => {
    expect(listAccessRequestsQuerySchema.parse({})).toEqual({ page: 1, limit: 10 });
  });

  it.each(['pending', 'in_review', 'approved', 'rejected'])('acepta el estado %s', (status) => {
    expect(listAccessRequestsQuerySchema.parse({ status, page: '2', limit: '5' })).toEqual({ status, page: 2, limit: 5 });
  });

  it('rechaza los borradores y estados desconocidos', () => {
    expect(messagesOf({ status: 'draft' })).toContain('status: El estado no es válido');
    expect(messagesOf({ status: 'otro' })).toContain('status: El estado no es válido');
  });

  it.each([['0'], ['-1'], ['1.5'], ['abc']])('rechaza la página %s', (page) => {
    expect(messagesOf({ page }).some((m) => m.startsWith('page:'))).toBe(true);
  });

  it('acota el límite entre 1 y el máximo', () => {
    expect(messagesOf({ limit: '0' })).toContain('limit: El límite debe ser mayor o igual a 1');
    expect(messagesOf({ limit: String(MAX_PAGE_SIZE + 1) })).toContain(`limit: El límite no puede superar ${MAX_PAGE_SIZE}`);
    expect(messagesOf({ limit: 'x' }).some((m) => m.startsWith('limit:'))).toBe(true);
    expect(messagesOf({ limit: '2.5' }).some((m) => m.startsWith('limit:'))).toBe(true);
    expect(messagesOf({ limit: String(MAX_PAGE_SIZE) })).toEqual([]);
  });
});

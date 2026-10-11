import { describe, expect, it } from 'vitest';
import { isSubmittedDuplicate, violatedConstraints } from '../helpers/unique-violation.js';

describe('violatedConstraints', () => {
  it('lee el índice del adaptador pg', () => {
    const meta = { driverAdapterError: { cause: { constraint: { index: 'uq_access_requests_email_submitted' } } } };
    expect(violatedConstraints(meta)).toEqual(['uq_access_requests_email_submitted']);
  });

  it('lee los campos de la restricción y el target del motor clásico', () => {
    expect(violatedConstraints({ driverAdapterError: { cause: { constraint: { fields: ['email'] } } } })).toEqual(['email']);
    expect(violatedConstraints({ target: ['request_code'] })).toEqual(['request_code']);
  });

  it.each([undefined, null, 'texto', {}, { target: 5 }])('devuelve vacío con la forma desconocida %j', (meta) => {
    expect(violatedConstraints(meta)).toEqual([]);
  });
});

describe('isSubmittedDuplicate', () => {
  it.each([
    'uq_access_requests_email_submitted',
    'uq_access_requests_id_card_submitted',
    'uq_access_requests_sis_code_submitted',
  ])('reconoce %s', (index) => {
    expect(isSubmittedDuplicate({ driverAdapterError: { cause: { constraint: { index } } } })).toBe(true);
  });

  it('no reconoce request_code ni una forma desconocida', () => {
    expect(isSubmittedDuplicate({ driverAdapterError: { cause: { constraint: { index: 'access_requests_request_code_key' } } } })).toBe(false);
    expect(isSubmittedDuplicate(undefined)).toBe(false);
  });
});

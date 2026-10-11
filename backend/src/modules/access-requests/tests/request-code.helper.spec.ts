import { describe, expect, it, vi } from 'vitest';
import { nextRequestCode, randomRetryDelayMs, requestCodePrefix, sleep } from '../helpers/request-code.js';
import { REQUEST_CODE_REGEX } from '../constants/request-code.constants.js';

describe('nextRequestCode', () => {
  it('el primer código del año es el 0001', () => {
    expect(nextRequestCode(2026, null)).toBe('SOL-2026-0001');
    expect(nextRequestCode(2026, undefined)).toBe('SOL-2026-0001');
  });

  it('suma uno al máximo existente y rellena con ceros', () => {
    expect(nextRequestCode(2026, 'SOL-2026-0001')).toBe('SOL-2026-0002');
    expect(nextRequestCode(2026, 'SOL-2026-0148')).toBe('SOL-2026-0149');
    expect(nextRequestCode(2026, 'SOL-2026-0999')).toBe('SOL-2026-1000');
  });

  it('un código de otro año o ilegible reinicia en 0001', () => {
    expect(nextRequestCode(2027, 'SOL-2026-0148')).toBe('SOL-2027-0001');
    expect(nextRequestCode(2026, 'SOL-2026-abcd')).toBe('SOL-2026-0001');
  });

  it('expone el prefijo y un patrón que acepta los códigos generados', () => {
    expect(requestCodePrefix(2026)).toBe('SOL-2026-');
    expect(REQUEST_CODE_REGEX.test(nextRequestCode(2026, 'SOL-2026-0009'))).toBe(true);
  });
});

describe('pausa entre intentos', () => {
  it('randomRetryDelayMs cubre de 5 a 40 ms', () => {
    expect(randomRetryDelayMs(() => 0)).toBe(5);
    expect(randomRetryDelayMs(() => 0.999999)).toBe(40);
    expect(randomRetryDelayMs(() => 0.5)).toBeGreaterThanOrEqual(5);
  });

  it('sleep espera el tiempo indicado', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const pending = sleep(20).then(done);

    await vi.advanceTimersByTimeAsync(19);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(done).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

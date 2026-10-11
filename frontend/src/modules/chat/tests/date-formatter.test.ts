import { describe, it, expect } from 'vitest';
import { formatConversationDate, getInitials } from '../utils/date-formatter';

describe('date-formatter', () => {
  it('debe devolver string vacio si la fecha es nula, indefinida o invalida', () => {
    expect(formatConversationDate(null)).toBe('');
    expect(formatConversationDate(undefined)).toBe('');
    expect(formatConversationDate('fecha-invalida')).toBe('');
  });

  it('debe formatear la hora si la fecha es de hoy', () => {
    const today = new Date().toISOString();
    const result = formatConversationDate(today);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(result.toLowerCase()).toMatch(/m/);
  });

  it('debe devolver "Ayer" si la fecha es del dia anterior', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatConversationDate(yesterday.toISOString())).toBe('Ayer');
  });

  it('debe devolver fecha corta si es anterior a ayer', () => {
    const olderDate = new Date('2026-01-15T10:00:00Z').toISOString();
    const result = formatConversationDate(olderDate);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('debe obtener las iniciales correctamente', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials('Maria')).toBe('MA');
    expect(getInitials('Maria Fernandez')).toBe('MF');
    expect(getInitials('Carlos Alberto Torrico')).toBe('CT');
  });
});
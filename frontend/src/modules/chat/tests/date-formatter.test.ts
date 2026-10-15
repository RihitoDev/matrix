import { describe, it, expect } from 'vitest';
import { formatConversationDate, formatTime12h, getInitials } from '../utils/date-formatter';

describe('date-formatter', () => {
  it('debe devolver string vacio si la fecha es nula, indefinida o invalida', () => {
    expect(formatConversationDate(null)).toBe('');
    expect(formatConversationDate(undefined)).toBe('');
    expect(formatConversationDate('fecha-invalida')).toBe('');
  });

  it('debe formatear la hora si la fecha es de hoy', () => {
    const today = new Date().toISOString();
    const result = formatConversationDate(today);
    expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });
 it('formatTime12h usa hh:mm AM/PM para cualquier hora', () => {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date();
      date.setHours(hour, 5, 0, 0);
      const expectedHour = String(hour % 12 || 12).padStart(2, '0');
      const expectedPeriod = hour >= 12 ? 'PM' : 'AM';
      expect(formatTime12h(date)).toBe(`${expectedHour}:05 ${expectedPeriod}`);
    }
  });
  it('debe devolver "Ayer" si la fecha es del dia anterior', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatConversationDate(yesterday.toISOString())).toBe('Ayer');
  });


     it('debe devolver fecha corta si es anterior a ayer', () => {
       for (const daysAgo of [2, 10, 400]) {
         const olderDate = new Date();
         olderDate.setDate(olderDate.getDate() - daysAgo);
         const dd = String(olderDate.getDate()).padStart(2, '0');
         const mm = String(olderDate.getMonth() + 1).padStart(2, '0');
         const aa = String(olderDate.getFullYear() % 100).padStart(2, '0');
         expect(formatConversationDate(olderDate.toISOString())).toBe(`${dd}/${mm}/${aa}`);
       }
     });
  

  it('debe obtener las iniciales correctamente', () => {
    expect(getInitials('')).toBe('U');
    expect(getInitials('Maria')).toBe('MA');
    expect(getInitials('Maria Fernandez')).toBe('MF');
    expect(getInitials('Carlos Alberto Torrico')).toBe('CT');
  });
});
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseEventDetail, parseEventItem } from './event-response';
import { parseRegistration } from './registration-response';
import { readArray, readCount, readRecord } from './response-validation';
const event = {
  id: '1',
  title: 'React',
  category: { id: 'cat', name: 'Tecnología' },
  eventDate: '2026-10-20',
  startTime: '09:00',
  endTime: '12:00',
  capacity: 30,
  availableSpots: 20,
  registrationCount: 10,
  statusId: 'published',
  modalityId: 'presencial',
};
describe('backend response validation', () => {
  it('normalizes missing optional fields before rendering', () => {
    expect(parseEventItem(event)).toMatchObject({
      description: null,
      location: null,
      instructorName: null,
    });
  });
  it.each([
    null,
    undefined,
    {},
    { ...event, category: null },
    { ...event, registrationCount: NaN },
  ])('rejects malformed events: %s', (value) => {
    expect(() => parseEventItem(value)).toThrow(
      'La respuesta del backend no es válida.',
    );
  });
  it('rejects a detail with missing modality rather than crashing in the panel', () => {
    expect(() => parseEventDetail(event)).toThrow();
    expect(
      parseEventDetail({
        ...event,
        modality: { id: 'presencial', title: 'Presencial' },
      }).modality.title,
    ).toBe('Presencial');
  });
  it.each([null, undefined, {}, 'invalid'])(
    'rejects invalid collections: %s',
    (value) => {
      expect(() => readArray(value)).toThrow();
    },
  );
  it('accepts empty collections and rejects invalid count and object values', () => {
    expect(readArray([])).toEqual([]);
    expect(() => readCount(-1)).toThrow();
    expect(() => readRecord([])).toThrow();
  });
  it('rejects missing passes and missing required fields', () => {
    expect(() => parseRegistration(null)).toThrow();
    expect(() => parseRegistration({ id: '1' })).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { createEducationSchema } from '../requests/create-education.request.js';
import { educationIdSchema } from '../requests/education-fields.schema.js';
import { updateEducationSchema } from '../requests/update-education.request.js';
import { EDUCATION_INSTITUTIONS } from '../constants/education-institutions.constants.js';

const input = {
  institution: ' UMSS ',
  degree: ' Computer Science ',
  startDate: '2020-02-29',
  endDate: '2024-12-31',
};

describe('Education requests', () => {
  it('accepts all 17 universities and canonicalizes their aliases', () => {
    expect(EDUCATION_INSTITUTIONS).toHaveLength(17);
    expect(new Set(EDUCATION_INSTITUTIONS.map((item) => item.name)).size).toBe(17);
    for (const institution of EDUCATION_INSTITUTIONS) {
      for (const value of [institution.name, ...institution.aliases]) {
        expect(createEducationSchema.parse({ ...input, institution: value }).institution).toBe(institution.name);
        expect(updateEducationSchema.parse({ institution: value }).institution).toBe(institution.name);
      }
    }
    expect(updateEducationSchema.parse({ institution: '  universidad mayor de san simon  ' }).institution)
      .toBe('Universidad Mayor de San Simón (UMSS)');
  });

  it.each(['gggggg', 'Universidad inventada', 'UMSS extra', 'UNIPOL', 'Universidad'])('rejects unknown institution %s', (institution) => {
    expect(createEducationSchema.safeParse({ ...input, institution }).success).toBe(false);
    expect(updateEducationSchema.safeParse({ institution }).success).toBe(false);
  });

  it.each(['UPAL', 'Universidad Privada Abierta Latinoamericana', 'Universidad Privada Abierta Latinoamericana (UPAL)', 'NUR', 'Universidad NUR', 'Universidad Pedagógica'])(
    'rejects excluded institution %s in creates and updates', (institution) => {
      for (const result of [createEducationSchema.safeParse({ ...input, institution }), updateEducationSchema.safeParse({ institution })]) {
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ['institution'] }));
      }
    },
  );

  it.each(['0001-01-01', '0201-02-01', '1899-12-31', '1939-12-31'])('rejects dates before 1940 in either field: %s', (date) => {
    for (const field of ['startDate', 'endDate']) {
      for (const result of [
        createEducationSchema.safeParse({ ...input, [field]: date }),
        updateEducationSchema.safeParse({ [field]: date }),
      ]) {
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(expect.objectContaining({ path: [field], message: 'Fecha inválida.' }));
        }
      }
    }
  });

  it('accepts the minimum date and still rejects impossible dates', () => {
    expect(createEducationSchema.safeParse({ ...input, startDate: '1940-01-01', endDate: '1940-01-01' }).success).toBe(true);
    expect(updateEducationSchema.safeParse({ startDate: '1940-01-01', endDate: '1940-01-01' }).success).toBe(true);
    expect(updateEducationSchema.safeParse({ startDate: '1940-02-29' }).success).toBe(true);
    expect(updateEducationSchema.safeParse({ startDate: '1941-02-29' }).success).toBe(false);
  });
  it.each([0, 400])('accepts descriptions of %i characters on creation and update', (length) => {
    const description = 'a'.repeat(length);
    expect(createEducationSchema.parse({ ...input, description }).description).toBe(description);
    expect(updateEducationSchema.parse({ description }).description).toBe(description);
  });

  it.each(['a'.repeat(401), ' '.repeat(401)])('rejects oversized descriptions before trimming on creation and update', (description) => {
    expect(createEducationSchema.safeParse({ ...input, description }).success).toBe(false);
    expect(updateEducationSchema.safeParse({ description }).success).toBe(false);
  });

  it('trims required strings and converts a valid calendar date to UTC', () => {
    expect(createEducationSchema.parse(input)).toEqual({
      institution: 'Universidad Mayor de San Simón (UMSS)',
      degree: 'Computer Science',
      startDate: new Date('2020-02-29T00:00:00.000Z'),
      endDate: new Date('2024-12-31T00:00:00.000Z'),
    });
  });

  it('accepts and trims an optional description and converts the end date', () => {
    const parsed = createEducationSchema.parse({
      ...input,
      endDate: '2024-12-31',
      description: ' Research ',
    });
    expect(parsed.endDate).toEqual(new Date('2024-12-31T00:00:00.000Z'));
    expect(parsed.description).toBe('Research');
  });

  it('accepts null for the optional description', () => {
    expect(
      createEducationSchema.parse({
        ...input,
        description: null,
      }),
    ).toMatchObject({
      description: null,
    });
  });

  it.each(['institution', 'degree', 'startDate', 'endDate'] as const)(
    'requires %s',
    (field) => {
      expect(
        createEducationSchema.safeParse({ ...input, [field]: undefined })
          .success,
      ).toBe(false);
      expect(
        createEducationSchema.safeParse({ ...input, [field]: null }).success,
      ).toBe(false);
      expect(
        createEducationSchema.safeParse({ ...input, [field]: ' ' }).success,
      ).toBe(false);
    },
  );

  it.each([
    '2023-02-29',
    '2024-02-30',
    '2024-13-01',
    '02/03/2024',
    '2024-01-01T00:00:00Z',
    '',
  ])('rejects invalid calendar date %s', (date) => {
    expect(
      createEducationSchema.safeParse({ ...input, startDate: date }).success,
    ).toBe(false);
    expect(
      createEducationSchema.safeParse({ ...input, endDate: date }).success,
    ).toBe(false);
  });

  it.each(['userId', 'id', 'createdAt', 'unknownField'])(
    'rejects externally assigned %s',
    (field) => {
      expect(
        createEducationSchema.safeParse({ ...input, [field]: 'unexpected' })
          .success,
      ).toBe(false);
      expect(
        updateEducationSchema.safeParse({
          degree: 'Updated',
          [field]: 'unexpected',
        }).success,
      ).toBe(false);
    },
  );

  it('allows partial edits and explicit clearing of optional fields', () => {
    expect(updateEducationSchema.parse({ degree: ' Updated ' })).toEqual({
      degree: 'Updated',
    });
    expect(
      updateEducationSchema.parse({ description: null }),
    ).toEqual({ description: null });
  });

  it.each(['institution', 'degree', 'startDate', 'endDate'] as const)(
    'rejects clearing %s in partial edits',
    (field) => {
      for (const value of [null, '', ' ']) {
        expect(updateEducationSchema.safeParse({ [field]: value }).success).toBe(false);
      }
    },
  );

  it('rejects empty or undefined-only edits', () => {
    expect(updateEducationSchema.safeParse({}).success).toBe(false);
    expect(updateEducationSchema.safeParse({ degree: undefined }).success).toBe(
      false,
    );
  });

  it('validates record identifiers as UUIDs', () => {
    expect(
      educationIdSchema.safeParse('33333333-3333-4333-8333-333333333333')
        .success,
    ).toBe(true);
    expect(educationIdSchema.safeParse('123').success).toBe(false);
  });
});

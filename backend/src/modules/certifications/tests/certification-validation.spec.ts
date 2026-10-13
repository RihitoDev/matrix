import { describe, expect, it } from 'vitest';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { RequestValidationPipe } from '../../../common/pipes/request-validation.pipe.js';
import { CERTIFICATION_VALIDATION_MESSAGES } from '../constants/certification.constants.js';
import { createCertificationSchema } from '../requests/create-certification.request.js';
import { updateCertificationSchema } from '../requests/update-certification.request.js';

const BUSINESS_TIMEZONE = 'America/La_Paz';

const validBody = {
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: '2024-05-10',
};

const createPipe = new RequestValidationPipe(createCertificationSchema);
const updatePipe = new RequestValidationPipe(updateCertificationSchema);



function todayInBolivia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
  }).format(new Date());
}

function tomorrowInBolivia(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(d);
}

function yesterdayInBolivia(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(d);
}

describe('Certification validation messages', () => {
  it('reports every required field in Spanish when the body is empty', () => {
    expect(
      createCertificationSchema.safeParse({
        name: '',
        issuingOrganization: '',
        issueDate: '',
      }).error?.issues,
    ).toEqual([
      expect.objectContaining({
        path: ['name'],
        message: CERTIFICATION_VALIDATION_MESSAGES.required,
      }),
      expect.objectContaining({
        path: ['issuingOrganization'],
        message: CERTIFICATION_VALIDATION_MESSAGES.required,
      }),
      expect.objectContaining({
        path: ['issueDate'],
        message: CERTIFICATION_VALIDATION_MESSAGES.required,
      }),
    ]);
  });

  it('returns the errors as field and message pairs through the pipe', () => {
    try {
      createPipe.transform({ ...validBody, name: '' });
      throw new Error('Expected the validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(RequestValidationException);
      expect((error as RequestValidationException).errors).toEqual([
        { field: 'name', message: CERTIFICATION_VALIDATION_MESSAGES.required },
      ]);
    }
  });

  it('reports missing fields with the required message', () => {
    const issues = createCertificationSchema.safeParse({}).error?.issues;

    expect(issues?.map((issue) => issue.message)).toEqual([
      CERTIFICATION_VALIDATION_MESSAGES.required,
      CERTIFICATION_VALIDATION_MESSAGES.required,
      CERTIFICATION_VALIDATION_MESSAGES.required,
    ]);
  });

  it('reports only the affected field when a single field is invalid', () => {
    const issues = createCertificationSchema.safeParse({
      ...validBody,
      issueDate: '',
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['issueDate'],
      message: CERTIFICATION_VALIDATION_MESSAGES.required,
    });
  });

  it('rejects values made only of spaces', () => {
    const issues = createCertificationSchema.safeParse({
      ...validBody,
      name: '   ',
      issuingOrganization: '\t ',
    }).error?.issues;

    expect(issues?.map((issue) => issue.path[0])).toEqual([
      'name',
      'issuingOrganization',
    ]);
    expect(issues?.every((issue) => issue.message === CERTIFICATION_VALIDATION_MESSAGES.required)).toBe(true);
  });

  it('reports a single message for an invalid date', () => {
    for (const issueDate of ['not-a-date', '2025-02-30', '10/05/2024', '2024-5-1']) {
      const issues = createCertificationSchema.safeParse({
        ...validBody,
        issueDate,
      }).error?.issues;

      expect(issues).toHaveLength(1);
      expect(issues?.[0]?.message).toBe(
        CERTIFICATION_VALIDATION_MESSAGES.invalidDate,
      );
    }
  });
});

describe('Certification length limits', () => {
  it('accepts a name of 150 characters and rejects 151', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        name: 'a'.repeat(150),
      }).success,
    ).toBe(true);

    const issues = createCertificationSchema.safeParse({
      ...validBody,
      name: 'a'.repeat(151),
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['name'],
      message: CERTIFICATION_VALIDATION_MESSAGES.nameTooLong,
    });
  });

  it('accepts an organization of 150 characters and rejects 151', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        issuingOrganization: 'a'.repeat(150),
      }).success,
    ).toBe(true);

    const issues = createCertificationSchema.safeParse({
      ...validBody,
      issuingOrganization: 'a'.repeat(151),
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['issuingOrganization'],
      message: CERTIFICATION_VALIDATION_MESSAGES.organizationTooLong,
    });
  });

  it('counts the length after trimming the spaces', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        name: ` ${'a'.repeat(150)} `,
      }).success,
    ).toBe(true);
  });
});

describe('Certification issue date', () => {
  it('accepts today and rejects tomorrow', () => {
    const today = todayInBolivia();

    expect(
      createCertificationSchema.safeParse({ ...validBody, issueDate: today })
        .success,
    ).toBe(true);

    const issues = createCertificationSchema.safeParse({
      ...validBody,
      issueDate: tomorrowInBolivia(),
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['issueDate'],
      message: CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    });
  });

  it('rejects 1949-12-31 and accepts 1950-01-01', () => {
    const issues = createCertificationSchema.safeParse({
      ...validBody,
      issueDate: '1949-12-31',
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['issueDate'],
      message: CERTIFICATION_VALIDATION_MESSAGES.minDate,
    });

    const accepted = createCertificationSchema.safeParse({
      ...validBody,
      issueDate: '1950-01-01',
    });

    expect(accepted.success).toBe(true);
    expect(accepted.data?.issueDate.toISOString()).toBe(
      '1950-01-01T00:00:00.000Z',
    );
  });

  it('applies the minimum date when editing', () => {
    expect(
      updateCertificationSchema.safeParse({ issueDate: '1949-12-31' }).error
        ?.issues[0],
    ).toMatchObject({
      path: ['issueDate'],
      message: CERTIFICATION_VALIDATION_MESSAGES.minDate,
    });
    expect(
      updateCertificationSchema.safeParse({ issueDate: '1950-01-01' }).success,
    ).toBe(true);
  });

  it('reports the invalid date message instead of the minimum for impossible dates', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        issueDate: '1949-02-30',
      }).error?.issues[0]?.message,
    ).toBe(CERTIFICATION_VALIDATION_MESSAGES.invalidDate);
  });

  it('converts a valid date to a Date at midnight UTC', () => {
    const result = createPipe.transform(validBody);

    expect(result.issueDate).toBeInstanceOf(Date);
    expect(result.issueDate.toISOString()).toBe('2024-05-10T00:00:00.000Z');
  });
});

describe('Certification sanitization', () => {
  it('rejects values with HTML or script tags', () => {
    const hostileHtml = [
      '<script>alert(1)</script>',
      'O\'Reilly "Cloud" <b>Architect</b>',
    ];

    for (const value of hostileHtml) {
      const issues = createCertificationSchema.safeParse({
        ...validBody,
        name: value,
        issuingOrganization: value,
      }).error?.issues;

      expect(issues?.map((issue) => issue.message)).toEqual([
        'No se permiten etiquetas HTML ni scripts',
        'No se permiten etiquetas HTML ni scripts',
      ]);
    }
  });

  it('keeps SQL injection attempts as plain text without altering it', () => {
    const sqlValue = "'; DROP TABLE certifications;--";
    const result = createPipe.transform({
      ...validBody,
      name: sqlValue,
      issuingOrganization: sqlValue,
    });

    expect(result.name).toBe(sqlValue);
    expect(result.issuingOrganization).toBe(sqlValue);
  });
});

describe('Certification validation when editing', () => {
  it('applies the same rules to the fields present in an update', () => {
    expect(updatePipe.transform({ name: ' Updated ' })).toEqual({
      name: 'Updated',
    });

    const issues = updateCertificationSchema.safeParse({
      name: '',
      issuingOrganization: 'a'.repeat(151),
      issueDate: tomorrowInBolivia(),
    }).error?.issues;

    expect(issues?.map((issue) => issue.message)).toEqual([
      CERTIFICATION_VALIDATION_MESSAGES.required,
      CERTIFICATION_VALIDATION_MESSAGES.organizationTooLong,
      CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    ]);
  });

  it('accepts the limits when editing', () => {
    expect(
      updateCertificationSchema.safeParse({
        name: 'a'.repeat(150),
        issuingOrganization: 'a'.repeat(150),
        issueDate: todayInBolivia(),
      }).success,
    ).toBe(true);
  });
});

describe('Certification issue date — Bolivia timezone (W10)', () => {
  it('accepts today in America/La_Paz', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        issueDate: todayInBolivia(),
      }).success,
    ).toBe(true);
  });

  it('rejects tomorrow in America/La_Paz', () => {
    const issues = createCertificationSchema.safeParse({
      ...validBody,
      issueDate: tomorrowInBolivia(),
    }).error?.issues;

    expect(issues).toHaveLength(1);
    expect(issues?.[0]).toMatchObject({
      path: ['issueDate'],
      message: CERTIFICATION_VALIDATION_MESSAGES.futureDate,
    });
  });

  it('accepts yesterday in America/La_Paz', () => {
    expect(
      createCertificationSchema.safeParse({
        ...validBody,
        issueDate: yesterdayInBolivia(),
      }).success,
    ).toBe(true);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccessRequestSchema } from '../requests/create-access-request.schema.js';
import { updateAccessRequestSchema } from '../requests/update-access-request.schema.js';
import { isAdult, isGraduationYearCoherent } from '../requests/access-request-fields.js';

const validPayload = {
  firstName: 'María José',
  lastName: 'Peña Ñáñez',
  idCardNumber: '1234567',
  idCardIssuedIn: 'CB',
  sisCode: '202012345',
  email: 'Maria@Umss.edu.bo',
  phone: '71234567',
  birthDate: '2000-05-10',
  career: 'Licenciatura en Ingeniería de Sistemas',
  graduationYear: 2019,
};

function messagesOf(payload: unknown, schema: typeof createAccessRequestSchema | typeof updateAccessRequestSchema = createAccessRequestSchema) {
  const result = schema.safeParse(payload);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

describe('createAccessRequestSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('acepta un payload válido y normaliza los datos', () => {
    const result = createAccessRequestSchema.parse({ ...validPayload, firstName: '  María José ' });
    expect(result.email).toBe('maria@umss.edu.bo');
    expect(result.firstName).toBe('María José');
    expect(result.birthDate).toEqual(new Date('2000-05-10T00:00:00.000Z'));
  });

  it('acepta el teléfono omitido', () => {
    const { phone: _phone, ...rest } = validPayload;
    expect(createAccessRequestSchema.safeParse(rest).success).toBe(true);
  });

  it.each(['Juan3', 'Juan_', 'J@n', '   '])('rechaza el nombre "%s"', (firstName) => {
    expect(messagesOf({ ...validPayload, firstName }).length).toBeGreaterThan(0);
  });

  it('rechaza nombres demasiado largos y apellidos inválidos', () => {
    expect(messagesOf({ ...validPayload, firstName: 'a'.repeat(101) })).toContain('firstName: Los nombres no pueden superar los 100 caracteres');
    expect(messagesOf({ ...validPayload, lastName: 'Pérez1' })).toContain('lastName: Los apellidos solo pueden contener letras y espacios');
  });

  it.each(['12a45', '', '1'.repeat(21)])('rechaza el carnet "%s"', (idCardNumber) => {
    expect(messagesOf({ ...validPayload, idCardNumber }).some((m) => m.startsWith('idCardNumber'))).toBe(true);
  });

  it('rechaza un SIS con letras', () => {
    expect(messagesOf({ ...validPayload, sisCode: '2020AB' })).toContain('sisCode: El código SIS solo puede contener dígitos');
  });

  it('rechaza un departamento de expedición desconocido', () => {
    expect(messagesOf({ ...validPayload, idCardIssuedIn: 'XX' })).toContain('idCardIssuedIn: El departamento de expedición no es válido');
  });

  it('rechaza un correo inválido o demasiado largo', () => {
    expect(messagesOf({ ...validPayload, email: 'no-es-correo' })).toContain('email: El correo no tiene un formato válido');
    expect(messagesOf({ ...validPayload, email: `${'a'.repeat(150)}@umss.edu.bo` }).some((m) => m.startsWith('email'))).toBe(true);
  });

  it.each(['12345', '123456789', 'abcdefgh', '1234 567'])('rechaza el teléfono "%s"', (phone) => {
    expect(messagesOf({ ...validPayload, phone })).toContain('phone: El teléfono debe tener entre 6 y 8 dígitos');
  });

  it.each(['123456', '1234567', '12345678'])('acepta el teléfono "%s"', (phone) => {
    expect(messagesOf({ ...validPayload, phone })).toEqual([]);
  });

  it('rechaza campos faltantes con mensajes en español', () => {
    const messages = messagesOf({});
    expect(messages).toContain('firstName: Los nombres son obligatorios');
    expect(messages).toContain('graduationYear: El año de titulación es obligatorio');
    expect(messages).toContain('career: La carrera no es válida');
  });

  describe('mayoría de edad (con fecha fija 2026-10-05)', () => {
    it('acepta quien cumple 18 hoy', () => {
      expect(createAccessRequestSchema.safeParse({ ...validPayload, birthDate: '2008-10-05', graduationYear: 2026 }).success).toBe(true);
    });

    it('rechaza quien cumple 18 mañana', () => {
      expect(messagesOf({ ...validPayload, birthDate: '2008-10-06', graduationYear: 2026 })).toContain('birthDate: Debes ser mayor de 18 años');
    });

    it('rechaza un nacimiento en el futuro', () => {
      expect(messagesOf({ ...validPayload, birthDate: '2030-01-01' })).toContain('birthDate: Debes ser mayor de 18 años');
    });

    it('rechaza formatos y fechas inexistentes', () => {
      expect(messagesOf({ ...validPayload, birthDate: '10/05/2000' })).toContain('birthDate: La fecha de nacimiento debe tener el formato AAAA-MM-DD');
      expect(messagesOf({ ...validPayload, birthDate: '2000-02-30' })).toContain('birthDate: La fecha de nacimiento no es válida');
    });
  });

  describe('año de titulación (con fecha fija 2026-10-05)', () => {
    it('acepta el año actual', () => {
      expect(createAccessRequestSchema.safeParse({ ...validPayload, graduationYear: 2026 }).success).toBe(true);
    });

    it('rechaza un año futuro', () => {
      expect(messagesOf({ ...validPayload, graduationYear: 2027 })).toContain('graduationYear: El año de titulación no puede ser futuro');
    });

    it('rechaza titularse antes de los 18 años (nace en 2000, mínimo 2018)', () => {
      expect(createAccessRequestSchema.safeParse({ ...validPayload, graduationYear: 2018 }).success).toBe(true);
      expect(messagesOf({ ...validPayload, graduationYear: 2017 })).toContain('graduationYear: El año de titulación no puede ser anterior a los 18 años de edad');
    });

    it('rechaza decimales y textos', () => {
      expect(messagesOf({ ...validPayload, graduationYear: 2019.5 })).toContain('graduationYear: El año de titulación debe ser un número entero');
      expect(messagesOf({ ...validPayload, graduationYear: '2019' }).some((m) => m.startsWith('graduationYear'))).toBe(true);
    });

    it('es obligatorio', () => {
      const { graduationYear: _graduationYear, ...rest } = validPayload;
      expect(messagesOf(rest)).toContain('graduationYear: El año de titulación es obligatorio');
    });
  });

  describe('carrera', () => {
    it.each(['Licenciatura en Ingeniería de Sistemas', 'Licenciatura Ingeniería en Informática'])('acepta "%s"', (career) => {
      expect(createAccessRequestSchema.safeParse({ ...validPayload, career }).success).toBe(true);
    });

    it.each(['Ingeniería de Sistemas', 'licenciatura en ingeniería de sistemas', ''])('rechaza "%s"', (career) => {
      expect(messagesOf({ ...validPayload, career })).toContain('career: La carrera no es válida');
    });

    it('es obligatoria', () => {
      const { career: _career, ...rest } = validPayload;
      expect(messagesOf(rest)).toContain('career: La carrera no es válida');
    });
  });
});

describe('updateAccessRequestSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('acepta actualizaciones parciales', () => {
    expect(updateAccessRequestSchema.parse({ phone: '71234567' })).toEqual({ phone: '71234567' });
  });

  it('acepta phone null para borrar el teléfono', () => {
    expect(updateAccessRequestSchema.parse({ phone: null })).toEqual({ phone: null });
  });

  it('create sigue sin aceptar phone null', () => {
    expect(messagesOf({ ...validPayload, phone: null }).some((m) => m.startsWith('phone'))).toBe(true);
  });

  it('rechaza un cuerpo vacío', () => {
    expect(messagesOf({}, updateAccessRequestSchema)).toContain(': Debes enviar al menos un campo para actualizar');
  });

  it('valida las reglas de cada campo enviado', () => {
    expect(messagesOf({ sisCode: 'abc' }, updateAccessRequestSchema)).toContain('sisCode: El código SIS solo puede contener dígitos');
  });

  it('acepta solo graduationYear, sin birthDate', () => {
    expect(updateAccessRequestSchema.safeParse({ graduationYear: 1990 }).success).toBe(true);
  });

  it('valida la coherencia solo si llegan ambos campos', () => {
    expect(messagesOf({ graduationYear: 2017, birthDate: '2000-05-10' }, updateAccessRequestSchema)).toContain(
      'graduationYear: El año de titulación no puede ser anterior a los 18 años de edad',
    );
  });

  it('acepta career opcional y rechaza null', () => {
    expect(updateAccessRequestSchema.safeParse({ career: 'Licenciatura Ingeniería en Informática' }).success).toBe(true);
    expect(messagesOf({ career: null }, updateAccessRequestSchema)).toContain('career: La carrera no es válida');
  });
});

describe('reglas de fecha', () => {
  it('isAdult maneja el 29 de febrero', () => {
    const now = new Date('2026-02-28T00:00:00Z');
    expect(isAdult(new Date('2008-02-28T00:00:00Z'), now)).toBe(true);
    expect(isAdult(new Date('2008-03-01T00:00:00Z'), now)).toBe(false);
  });

  it('isGraduationYearCoherent usa el año de nacimiento más 18', () => {
    expect(isGraduationYearCoherent(2018, new Date('2000-12-31T00:00:00Z'))).toBe(true);
    expect(isGraduationYearCoherent(2017, new Date('2000-01-01T00:00:00Z'))).toBe(false);
  });
});

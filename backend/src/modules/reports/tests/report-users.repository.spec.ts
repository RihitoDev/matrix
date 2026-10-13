import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';

const CREATED_AT = new Date('2026-03-10T15:00:00.000Z');
const SUBMITTED_AT = new Date('2026-04-02T15:00:00.000Z');

function buildPrisma(users: unknown[], requests: unknown[]) {
  return {
    user: { findMany: vi.fn().mockResolvedValue(users) },
    accessRequest: { findMany: vi.fn().mockResolvedValue(requests) },
  };
}

function buildRequest(overrides: Record<string, unknown>) {
  return {
    id: 'request-1',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'ana@umss.edu',
    idCardNumber: '1234567',
    rejectionReason: null,
    submittedAt: SUBMITTED_AT,
    createdAt: CREATED_AT,
    status: { title: 'approved' },
    documentType: { title: 'academic_diploma' },
    ...overrides,
  };
}

function buildUser(overrides: Record<string, unknown>) {
  return {
    id: 'user-1',
    firstName: 'Ana',
    lastName: 'Pérez',
    email: 'Ana@umss.edu',
    createdAt: CREATED_AT,
    roles: [{ role: { name: 'titulado' } }],
    ...overrides,
  };
}

async function loadUsers(users: unknown[], requests: unknown[]) {
  const prisma = buildPrisma(users, requests);
  const repository = new ReportUsersRepository(
    prisma as unknown as PrismaService,
  );
  return { prisma, users: await repository.findAll() };
}

describe('ReportUsersRepository', () => {
  it('solo pide a access_requests las solicitudes aprobadas y rechazadas', async () => {
    const { prisma } = await loadUsers([], []);

    expect(prisma.accessRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { title: { in: ['approved', 'rejected'] } } },
      }),
    );
  });

  it('completa al usuario registrado con el CI y el documento de su solicitud aprobada', async () => {
    const { users } = await loadUsers([buildUser({})], [buildRequest({})]);

    expect(users).toEqual([
      {
        id: 'user-1',
        fullName: 'Ana Pérez',
        email: 'Ana@umss.edu',
        userType: 'titulado',
        identifier: '1234567',
        documentType: 'academic_diploma',
        registeredAt: CREATED_AT.toISOString(),
        registrationStatus: 'APPROVED',
        rejectionReason: null,
      },
    ]);
  });

  it('deja vacíos el CI y el documento del usuario sin solicitud aprobada', async () => {
    const { users } = await loadUsers(
      [
        buildUser({
          email: 'mentor@umss.edu',
          roles: [{ role: { name: 'mentor' } }],
        }),
      ],
      [buildRequest({ status: { title: 'rejected' } })],
    );

    expect(users[0]).toMatchObject({
      email: 'mentor@umss.edu',
      userType: 'mentor',
      identifier: '',
      documentType: null,
      registrationStatus: 'APPROVED',
    });
  });

  it('usa titulado si el usuario no tiene un rol conocido', async () => {
    const { users } = await loadUsers([buildUser({ roles: [] })], []);

    expect(users[0].userType).toBe('titulado');
  });

  it('convierte cada solicitud rechazada en un usuario rechazado con su motivo', async () => {
    const { users } = await loadUsers(
      [],
      [
        buildRequest({
          id: 'request-2',
          status: { title: 'rejected' },
          documentType: { title: 'national_title' },
          rejectionReason: 'Documento ilegible',
        }),
      ],
    );

    expect(users).toEqual([
      {
        id: 'request-2',
        fullName: 'Ana Pérez',
        email: 'ana@umss.edu',
        userType: 'titulado',
        identifier: '1234567',
        documentType: 'national_title',
        registeredAt: SUBMITTED_AT.toISOString(),
        registrationStatus: 'REJECTED',
        rejectionReason: 'Documento ilegible',
      },
    ]);
  });

  it('usa la fecha de creación si la solicitud rechazada no tiene fecha de envío', async () => {
    const { users } = await loadUsers(
      [],
      [
        buildRequest({
          status: { title: 'rejected' },
          submittedAt: null,
          documentType: null,
        }),
      ],
    );

    expect(users[0]).toMatchObject({
      registeredAt: CREATED_AT.toISOString(),
      documentType: null,
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { RequestValidationPipe } from '../../../common/pipes/request-validation.pipe.js';
import { CertificationsController } from '../controllers/certifications.controller.js';
import { createCertificationSchema } from '../requests/create-certification.request.js';
import { updateCertificationSchema } from '../requests/update-certification.request.js';
import { CertificationsService } from '../services/certifications.service.js';
import type { CertificationResponse } from '../types/certification-response.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const certificationId = '33333333-3333-4333-8333-333333333333';

const response: CertificationResponse = {
  id: certificationId,
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: '2024-05-10',
  hasDocument: false,
  createdAt: '2024-05-11T10:00:00.000Z',
  updatedAt: '2024-05-11T10:00:00.000Z',
};

describe('CertificationsController', () => {
  let controller: CertificationsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    controller = new CertificationsController(
      service as unknown as CertificationsService,
    );
  });

  it('delegates creation to the service', async () => {
    const request = {
      name: 'AWS Solutions Architect',
      issuingOrganization: 'Amazon',
      issueDate: new Date('2024-05-10'),
    };
    service.create.mockResolvedValue(response);

    await expect(controller.create(userId, request)).resolves.toBe(response);
    expect(service.create).toHaveBeenCalledWith(userId, request);
  });

  it('delegates listing to the service', async () => {
    service.findAll.mockResolvedValue([response]);

    await expect(controller.findAll(userId)).resolves.toEqual([response]);
    expect(service.findAll).toHaveBeenCalledWith(userId);
  });

  it('delegates update to the service', async () => {
    service.update.mockResolvedValue(response);

    await expect(
      controller.update(userId, certificationId, { name: 'Updated' }),
    ).resolves.toBe(response);
    expect(service.update).toHaveBeenCalledWith(userId, certificationId, {
      name: 'Updated',
    });
  });

  it('delegates removal to the service', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove(userId, certificationId),
    ).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(userId, certificationId);
  });
});

describe('Certification request validation', () => {
  const createPipe = new RequestValidationPipe(createCertificationSchema);
  const updatePipe = new RequestValidationPipe(updateCertificationSchema);
  const validBody = {
    name: 'AWS Solutions Architect',
    issuingOrganization: 'Amazon',
    issueDate: '2024-05-10',
  };

  it('parses a valid create body and converts the date', () => {
    const result = createPipe.transform(validBody);

    expect(result.issueDate).toBeInstanceOf(Date);
    expect(result.name).toBe(validBody.name);
  });

  it.each([
    ['empty name', { ...validBody, name: '' }],
    ['name over 150 characters', { ...validBody, name: 'a'.repeat(151) }],
    ['empty organization', { ...validBody, issuingOrganization: '' }],
    [
      'organization over 100 characters',
      { ...validBody, issuingOrganization: 'a'.repeat(101) },
    ],
    ['missing issue date', { name: 'x', issuingOrganization: 'y' }],
    ['unparseable issue date', { ...validBody, issueDate: 'not-a-date' }],
    ['future issue date', { ...validBody, issueDate: '2999-01-01' }],
  ])('rejects create body with %s', (_label, body) => {
    expect(() => createPipe.transform(body)).toThrow(
      RequestValidationException,
    );
  });

  it('accepts a partial update body', () => {
    expect(updatePipe.transform({ name: 'Updated' })).toEqual({
      name: 'Updated',
    });
  });

  it('applies the same constraints to present update fields', () => {
    expect(() => updatePipe.transform({ issueDate: '2999-01-01' })).toThrow(
      RequestValidationException,
    );
    expect(() => updatePipe.transform({ name: '' })).toThrow(
      RequestValidationException,
    );
  });
});

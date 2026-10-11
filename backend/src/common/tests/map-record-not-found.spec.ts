import { describe, expect, it } from 'vitest';
import { Prisma } from '../../prisma/client.js';
import { DomainException } from '../exceptions/domain.exception.js';
import {
  isRecordNotFoundError,
  mapRecordNotFound,
} from '../utils/map-record-not-found.js';

const buildPrismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
  });

const createNotFound = () => new DomainException('Record not found', 404);

describe('isRecordNotFoundError', () => {
  it('recognizes the Prisma record not found error', () => {
    expect(isRecordNotFoundError(buildPrismaError('P2025'))).toBe(true);
  });

  it('ignores other Prisma errors and unknown errors', () => {
    expect(isRecordNotFoundError(buildPrismaError('P2002'))).toBe(false);
    expect(isRecordNotFoundError(new Error('Unexpected'))).toBe(false);
  });
});

describe('mapRecordNotFound', () => {
  it('returns the result of the operation', async () => {
    await expect(mapRecordNotFound(Promise.resolve('saved'), createNotFound)).resolves.toBe(
      'saved',
    );
  });

  it('throws the domain exception when the record does not exist', async () => {
    await expect(
      mapRecordNotFound(Promise.reject(buildPrismaError('P2025')), createNotFound),
    ).rejects.toMatchObject({ message: 'Record not found', statusCode: 404 });
  });

  it('rethrows any other error', async () => {
    const error = buildPrismaError('P2002');

    await expect(mapRecordNotFound(Promise.reject(error), createNotFound)).rejects.toBe(error);
  });
});

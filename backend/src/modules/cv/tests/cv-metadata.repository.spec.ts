import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CvMetadataRepository } from '../repositories/cv-metadata.repository.js';

const userId = '11111111-1111-4111-8111-111111111111';

describe('CvMetadataRepository', () => {
  let repository: CvMetadataRepository;
  let queryRaw: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryRaw = vi.fn();
    repository = new CvMetadataRepository({
      $queryRaw: queryRaw,
    } as unknown as PrismaService);
  });

  it('queries the metadata of the user without selecting the file bytes', async () => {
    queryRaw.mockResolvedValue([]);

    await repository.findByUserId(userId);

    const [strings, ...values] = queryRaw.mock.calls[0] as [
      TemplateStringsArray,
      ...unknown[],
    ];
    const sql = strings.join('?');
    expect(values).toEqual([userId]);
    expect(sql).toContain('octet_length(cv_pdf_url)');
    expect(sql.match(/cv_pdf_url/g)).toHaveLength(1);
    expect(sql).not.toContain('password');
  });

  it('returns the metadata record of the user', async () => {
    const record = {
      firstName: 'Test',
      lastName: 'User',
      sizeBytes: 1024,
      updatedAt: new Date('2026-10-03T12:00:00.000Z'),
    };
    queryRaw.mockResolvedValue([record]);

    await expect(repository.findByUserId(userId)).resolves.toEqual(record);
  });

  it('returns null when the user does not exist', async () => {
    queryRaw.mockResolvedValue([]);

    await expect(repository.findByUserId(userId)).resolves.toBeNull();
  });
});

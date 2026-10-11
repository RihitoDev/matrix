import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { FilesRepository } from '../repositories/files.repository.js';
import { FileNotFoundException } from '../exceptions/index.js';

function build() {
  const file = { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() };
  return { file, repository: new FilesRepository({ file } as any) };
}

const newFile = { name: 'a', extension: 'pdf', mimeType: 'application/pdf', size: 3, content: Buffer.from([1, 2, 3]) };

describe('FilesRepository', () => {
  it('create guarda los bytes pero no los devuelve', async () => {
    const { file, repository } = build();
    file.create.mockResolvedValue({ id: 'f-1' });

    await repository.create(newFile);

    const args = file.create.mock.calls[0][0];
    expect(args.data.content).toEqual(new Uint8Array([1, 2, 3]));
    expect(args.select).not.toHaveProperty('content');
  });

  it('findMetadataById no selecciona content', async () => {
    const { file, repository } = build();
    file.findUnique.mockResolvedValue(null);

    await repository.findMetadataById('f-1');

    const args = file.findUnique.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'f-1' });
    expect(args.select).not.toHaveProperty('content');
  });

  it('findContentById es la única consulta que selecciona content', async () => {
    const { file, repository } = build();
    file.findUnique.mockResolvedValue(null);

    await repository.findContentById('f-1');

    expect(file.findUnique.mock.calls[0][0].select.content).toBe(true);
  });

  it('delete elimina por id', async () => {
    const { file, repository } = build();
    file.delete.mockResolvedValue({});

    await expect(repository.delete('f-1')).resolves.toBeUndefined();
    expect(file.delete).toHaveBeenCalledWith({ where: { id: 'f-1' }, select: { id: true } });
  });

  it('convierte P2025 en 404 de dominio', async () => {
    const { file, repository } = build();
    file.delete.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test' }));

    await expect(repository.delete('f-1')).rejects.toBeInstanceOf(FileNotFoundException);
  });

  it('propaga cualquier otro error', async () => {
    const { file, repository } = build();
    const boom = new Error('db caída');
    file.delete.mockRejectedValue(boom);

    await expect(repository.delete('f-1')).rejects.toBe(boom);
  });
});

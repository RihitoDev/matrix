import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileNotFoundException } from '../../files/exceptions/index.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import {
  AccessRequestNotEditableException,
  AccessRequestNotFoundException,
  InvalidDocumentTypeException,
  MissingDocumentFileException,
} from '../exceptions/index.js';

const file = { originalname: 'titulo.pdf', mimetype: 'application/pdf', size: 4, buffer: Buffer.from('%PDF') };

function row(overrides: Record<string, unknown> = {}) {
  return { id: 'id-1', documentFileId: null, status: { title: 'draft' }, ...overrides };
}

describe('AccessRequestsService (documento de respaldo)', () => {
  const repository = { findById: vi.fn(), setDocument: vi.fn(), clearDocument: vi.fn() };
  const filesService = { create: vi.fn(), delete: vi.fn() };
  const authService = { existsByEmail: vi.fn() };
  let service: AccessRequestsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AccessRequestsService(repository as any, authService as any, filesService as any);
    repository.findById.mockResolvedValue(row());
    filesService.create.mockResolvedValue({ id: 'file-new' });
    filesService.delete.mockResolvedValue(undefined);
    repository.setDocument.mockResolvedValue(null);
    repository.clearDocument.mockResolvedValue('file-old');
  });

  describe('attachDocument', () => {
    it('guarda el archivo, lo enlaza y devuelve la referencia', async () => {
      const result = await service.attachDocument('id-1', { file, documentType: 'academic_diploma' });

      expect(filesService.create).toHaveBeenCalledWith({ name: 'titulo.pdf', content: file.buffer });
      expect(repository.setDocument).toHaveBeenCalledWith('id-1', 'file-new', 'academic_diploma');
      expect(filesService.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'id-1', documentFileId: 'file-new', documentType: 'academic_diploma' });
    });

    it('lanza 404 si el borrador no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).rejects.toBeInstanceOf(
        AccessRequestNotFoundException,
      );
      expect(filesService.create).not.toHaveBeenCalled();
    });

    it('lanza 409 si la solicitud ya fue enviada', async () => {
      repository.findById.mockResolvedValue(row({ status: { title: 'pending' } }));

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).rejects.toBeInstanceOf(
        AccessRequestNotEditableException,
      );
      expect(filesService.create).not.toHaveBeenCalled();
    });

    it('lanza 400 si no hay archivo', async () => {
      await expect(service.attachDocument('id-1', { file: undefined, documentType: 'national_title' })).rejects.toBeInstanceOf(
        MissingDocumentFileException,
      );
      expect(filesService.create).not.toHaveBeenCalled();
    });

    it.each([undefined, '', 'ACADEMIC_DIPLOMA', 'otro'])('rechaza el tipo %j sin crear el archivo', async (documentType) => {
      await expect(service.attachDocument('id-1', { file, documentType })).rejects.toBeInstanceOf(InvalidDocumentTypeException);
      expect(filesService.create).not.toHaveBeenCalled();
    });

    it('propaga el error de FilesService sin tocar el repository', async () => {
      const boom = new Error('formato');
      filesService.create.mockRejectedValue(boom);

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).rejects.toBe(boom);
      expect(repository.setDocument).not.toHaveBeenCalled();
    });

    it('si el repository falla borra el archivo nuevo y relanza el error original', async () => {
      const boom = new Error('db caída');
      repository.setDocument.mockRejectedValue(boom);

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).rejects.toBe(boom);
      expect(filesService.delete).toHaveBeenCalledTimes(1);
      expect(filesService.delete).toHaveBeenCalledWith('file-new');
    });

    it('si el repository falla y el borrado del nuevo también, relanza el error original', async () => {
      const boom = new Error('db caída');
      repository.setDocument.mockRejectedValue(boom);
      filesService.delete.mockRejectedValue(new Error('otro'));

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).rejects.toBe(boom);
    });

    it('al reemplazar borra el archivo anterior después de enlazar el nuevo', async () => {
      repository.setDocument.mockResolvedValue('file-old');

      const result = await service.attachDocument('id-1', { file, documentType: 'national_title' });

      expect(filesService.delete).toHaveBeenCalledWith('file-old');
      expect(repository.setDocument.mock.invocationCallOrder[0]).toBeLessThan(filesService.delete.mock.invocationCallOrder[0]);
      expect(result.documentFileId).toBe('file-new');
    });

    it.each([new FileNotFoundException(), new Error('db caída')])('no falla si el borrado del anterior lanza %s', async (error) => {
      repository.setDocument.mockResolvedValue('file-old');
      filesService.delete.mockRejectedValue(error);

      await expect(service.attachDocument('id-1', { file, documentType: 'national_title' })).resolves.toEqual({
        id: 'id-1',
        documentFileId: 'file-new',
        documentType: 'national_title',
      });
    });
  });

  describe('removeDocument', () => {
    beforeEach(() => {
      repository.findById.mockResolvedValue(row({ documentFileId: 'file-old' }));
    });

    it('limpia la referencia y después borra el archivo', async () => {
      const result = await service.removeDocument('id-1');

      expect(repository.clearDocument).toHaveBeenCalledWith('id-1');
      expect(filesService.delete).toHaveBeenCalledWith('file-old');
      expect(repository.clearDocument.mock.invocationCallOrder[0]).toBeLessThan(filesService.delete.mock.invocationCallOrder[0]);
      expect(result).toEqual({ id: 'id-1', documentFileId: null });
    });

    it('sin documento responde igual y no toca nada', async () => {
      repository.findById.mockResolvedValue(row());

      await expect(service.removeDocument('id-1')).resolves.toEqual({ id: 'id-1', documentFileId: null });
      expect(repository.clearDocument).not.toHaveBeenCalled();
      expect(filesService.delete).not.toHaveBeenCalled();
    });

    it('lanza 404 si el borrador no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.removeDocument('id-1')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
      expect(repository.clearDocument).not.toHaveBeenCalled();
    });

    it('lanza 409 si la solicitud ya fue enviada', async () => {
      repository.findById.mockResolvedValue(row({ status: { title: 'approved' }, documentFileId: 'file-old' }));

      await expect(service.removeDocument('id-1')).rejects.toBeInstanceOf(AccessRequestNotEditableException);
      expect(repository.clearDocument).not.toHaveBeenCalled();
      expect(filesService.delete).not.toHaveBeenCalled();
    });

    it('propaga el error del repository sin borrar el archivo', async () => {
      const boom = new AccessRequestNotFoundException();
      repository.clearDocument.mockRejectedValue(boom);

      await expect(service.removeDocument('id-1')).rejects.toBe(boom);
      expect(filesService.delete).not.toHaveBeenCalled();
    });

    it.each([new FileNotFoundException(), new Error('db caída')])('no falla si el borrado del archivo lanza %s', async (error) => {
      filesService.delete.mockRejectedValue(error);

      await expect(service.removeDocument('id-1')).resolves.toEqual({ id: 'id-1', documentFileId: null });
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilesService } from '../services/files.service.js';
import {
  EmptyFileException,
  FileNotFoundException,
  FileTooLargeException,
  InvalidFileTypeException,
} from '../exceptions/index.js';
import { MAX_FILE_SIZE_BYTES } from '../constants/file-rules.constants.js';

const PDF = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);

describe('FilesService', () => {
  const repository = { create: vi.fn(), findMetadataById: vi.fn(), findContentById: vi.fn(), delete: vi.fn() };
  let service: FilesService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new FilesService(repository as any);
    repository.create.mockImplementation(async (data) => ({ id: 'f-1', ...data, content: undefined }));
  });

  it.each([
    ['pdf', 'application/pdf', PDF],
    ['png', 'image/png', PNG],
    ['jpg', 'image/jpeg', JPG],
  ])('guarda %s detectando tipo y MIME por el contenido', async (extension, mimeType, content) => {
    await service.create({ name: 'diploma', content });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'diploma',
      extension,
      mimeType,
      size: content.length,
      content,
    });
  });

  it('la extensión guardada sale del tipo detectado, no del nombre', async () => {
    await service.create({ name: 'foto.png', content: PDF });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'foto', extension: 'pdf' }));
  });

  it('rechaza un archivo vacío con 400', async () => {
    const error = await service.create({ name: 'a', content: Buffer.alloc(0) }).catch((e) => e);

    expect(error).toBeInstanceOf(EmptyFileException);
    expect(error.statusCode).toBe(400);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rechaza más de 10 MB con 413 y acepta exactamente 10 MB', async () => {
    const exact = Buffer.concat([PDF, Buffer.alloc(MAX_FILE_SIZE_BYTES - PDF.length)]);
    await expect(service.create({ name: 'a', content: exact })).resolves.toBeDefined();

    const big = Buffer.concat([PDF, Buffer.alloc(MAX_FILE_SIZE_BYTES - PDF.length + 1)]);
    const error = await service.create({ name: 'a', content: big }).catch((e) => e);
    expect(error).toBeInstanceOf(FileTooLargeException);
    expect(error.statusCode).toBe(413);
  });

  it('rechaza un tipo no permitido con 400 aunque el nombre diga .pdf', async () => {
    const error = await service.create({ name: 'virus.pdf', content: Buffer.from('MZ-ejecutable') }).catch((e) => e);

    expect(error).toBeInstanceOf(InvalidFileTypeException);
    expect(error.statusCode).toBe(400);
  });

  it('rechaza un archivo más corto que la firma completa', async () => {
    await expect(service.create({ name: 'a', content: PNG.subarray(0, 4) })).rejects.toBeInstanceOf(InvalidFileTypeException);
  });

  it.each([
    ['../../etc/passwd', 'passwd'],
    ['C:\\docs\\tesis.pdf', 'tesis'],
    ['Mi título.PDF', 'Mi título'],
    ['a<b>:c|d?.png', 'abcd'],
    ['  informe final  ', 'informe final'],
    ['informe.v2.jpeg', 'informe.v2'],
    ['con\u0000control\u001f', 'concontrol'],
  ])('sanea el nombre %j como %j', async (rawName, expected) => {
    await service.create({ name: rawName, content: PDF });

    expect(repository.create.mock.calls[0][0].name).toBe(expected);
  });

  it.each([[''], ['.'], ['...'], ['  '], ['.pdf'], ['carpeta/'], [' . . '], [undefined as unknown as string]])(
    'usa el nombre por defecto si %j queda vacío',
    async (rawName) => {
      await service.create({ name: rawName, content: PDF });

      expect(repository.create.mock.calls[0][0].name).toBe('documento');
    },
  );

  it('recorta el nombre a 200 caracteres sin dejar puntos al final', async () => {
    await service.create({ name: `${'a'.repeat(199)}.b`, content: PDF });

    expect(repository.create.mock.calls[0][0].name).toBe('a'.repeat(199));
  });

  it('no devuelve el contenido al crear', async () => {
    const result = await service.create({ name: 'a', content: PDF });

    expect(result.id).toBe('f-1');
    expect(result.content).toBeUndefined();
  });

  it('getMetadata devuelve los metadatos o lanza 404', async () => {
    repository.findMetadataById.mockResolvedValueOnce({ id: 'f-1' });
    await expect(service.getMetadata('f-1')).resolves.toEqual({ id: 'f-1' });

    repository.findMetadataById.mockResolvedValueOnce(null);
    await expect(service.getMetadata('f-2')).rejects.toBeInstanceOf(FileNotFoundException);
  });

  it('getContent devuelve los bytes como Buffer o lanza 404', async () => {
    repository.findContentById.mockResolvedValueOnce({
      name: 'a',
      extension: 'pdf',
      mimeType: 'application/pdf',
      content: new Uint8Array(PDF),
    });
    const file = await service.getContent('f-1');
    expect(Buffer.isBuffer(file.content)).toBe(true);
    expect(file.content.equals(PDF)).toBe(true);

    repository.findContentById.mockResolvedValueOnce(null);
    await expect(service.getContent('f-2')).rejects.toBeInstanceOf(FileNotFoundException);
  });

  it('delete delega en el repository', async () => {
    repository.delete.mockResolvedValue(undefined);

    await service.delete('f-1');

    expect(repository.delete).toHaveBeenCalledWith('f-1');
  });
});

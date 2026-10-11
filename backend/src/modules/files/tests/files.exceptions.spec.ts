import { describe, expect, it } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain.exception.js';
import {
  EmptyFileException,
  FileNotFoundException,
  FileTooLargeException,
  InvalidFileTypeException,
} from '../exceptions/index.js';

describe('excepciones de files', () => {
  it.each([
    [EmptyFileException, 400, 'El archivo está vacío'],
    [FileTooLargeException, 413, 'El archivo no puede superar los 10 MB'],
    [InvalidFileTypeException, 400, 'Solo se permiten archivos JPG, PNG o PDF'],
    [FileNotFoundException, 404, 'El archivo no existe'],
  ])('%o usa el código y mensaje por defecto', (Exception, statusCode, message) => {
    const error = new Exception();
    expect(error).toBeInstanceOf(DomainException);
    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe(message);
  });

  it('permite un mensaje personalizado', () => {
    expect(new FileNotFoundException('otro').message).toBe('otro');
  });
});

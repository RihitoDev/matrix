import { describe, expect, it } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain.exception.js';
import {
  AccessRequestCatalogMissingException,
  AccessRequestNotEditableException,
  AccessRequestNotFoundException,
  ActiveAccessRequestExistsException,
  DocumentRequiredToSubmitException,
  DuplicateAccessRequestDataException,
  InvalidDocumentTypeException,
  InvalidGraduationYearException,
  MissingDocumentFileException,
  RequestCodeGenerationException,
} from '../exceptions/index.js';

describe('excepciones de access-requests', () => {
  it.each([
    [AccessRequestNotFoundException, 404, 'La solicitud de acceso no existe'],
    [
      AccessRequestCatalogMissingException,
      500,
      'No se pudo completar la solicitud porque faltan datos base (carreras o estados). Avisa al administrador.',
    ],
    [AccessRequestNotEditableException, 409, 'La solicitud ya fue enviada y no se puede modificar'],
    [DuplicateAccessRequestDataException, 409, 'Ya existe una cuenta o solicitud con estos datos'],
    [DocumentRequiredToSubmitException, 400, 'Debes adjuntar tu documento de respaldo antes de enviar la solicitud'],
    [ActiveAccessRequestExistsException, 409, 'Ya tienes una solicitud activa'],
    [RequestCodeGenerationException, 503, 'No se pudo generar el código de la solicitud. Inténtalo de nuevo.'],
    [InvalidDocumentTypeException, 400, 'El tipo de documento no es válido'],
    [MissingDocumentFileException, 400, 'Debes adjuntar un archivo'],
    [InvalidGraduationYearException, 400, 'El año de titulación no puede ser anterior a los 18 años de edad'],
  ])('%o usa el código y mensaje por defecto', (Exception, statusCode, message) => {
    const error = new Exception();
    expect(error).toBeInstanceOf(DomainException);
    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe(message);
  });

  it('permite un mensaje personalizado', () => {
    expect(new AccessRequestNotFoundException('otro').message).toBe('otro');
  });
});

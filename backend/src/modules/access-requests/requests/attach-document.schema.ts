import { z } from 'zod';
import { ACCESS_REQUEST_DOCUMENT_TYPE } from '../types/access-request.enum.js';

export const attachDocumentSchema = z.object({
  documentType: z.enum(ACCESS_REQUEST_DOCUMENT_TYPE, { error: 'El tipo de documento no es válido' }),
});

export type AttachDocumentDto = z.infer<typeof attachDocumentSchema>;

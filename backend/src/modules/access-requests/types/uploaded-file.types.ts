// Forma mínima del archivo recibido por multipart (evita depender de @types/multer)
export interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface AttachDocumentInput {
  file: UploadedDocumentFile | undefined;
  documentType: string | undefined;
}

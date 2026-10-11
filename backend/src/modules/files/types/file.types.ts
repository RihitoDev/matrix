export interface FileMetadata {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileContent {
  name: string;
  extension: string;
  mimeType: string;
  content: Buffer;
}

export interface CreateFileInput {
  name: string;
  content: Buffer;
}

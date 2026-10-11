import { Injectable } from '@nestjs/common';
import { FILE_SIGNATURES } from '../constants/file-signatures.constants.js';
import { CorruptedFileException } from '../exceptions/corrupted-file.exception.js';
import { EmptyFileException } from '../exceptions/empty-file.exception.js';
import { FileTooLargeException } from '../exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception.js';
import type { FileSignature } from '../types/file-signature.type.js';
import type { FileValidationRules } from '../types/file-validation-rules.type.js';
import type { UploadedFile } from '../types/uploaded-file.type.js';
import type { ValidatedFile } from '../types/validated-file.type.js';

const MIN_REALISTIC_FILE_SIZE = 50;
const INTEGRITY_TAIL_BYTES = 1024;

const PDF_EOF_MARKER = Buffer.from('%%EOF');
const PNG_IEND_CHUNK = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
const JPG_EOI_BYTE_0 = 0xff;
const JPG_EOI_BYTE_1 = 0xd9;

@Injectable()
export class FileValidationService {
  validate(
    file: UploadedFile | undefined,
    rules: FileValidationRules,
  ): ValidatedFile {
    if (!file || file.size === 0 || file.buffer.length === 0) {
      throw new EmptyFileException();
    }

    if (file.size > rules.maxSizeBytes || file.buffer.length > rules.maxSizeBytes) {
      throw new FileTooLargeException();
    }

    const signature = this.detectSignature(file.buffer);

    if (!signature || !rules.allowedTypes.includes(signature.type)) {
      throw new InvalidFileTypeException();
    }

    if (!this.isStructurallyIntact(file.buffer, signature.type)) {
      throw new CorruptedFileException();
    }

    return {
      ...file,
      detectedType: signature.type,
      detectedMimeType: signature.mimeType,
    };
  }

  detectMimeType(buffer: Buffer): string | undefined {
    return this.detectSignature(buffer)?.mimeType;
  }

  private detectSignature(buffer: Buffer): FileSignature | undefined {
    return FILE_SIGNATURES.find((signature) =>
      signature.bytes.every((byte, index) => buffer[index] === byte),
    );
  }

  private isStructurallyIntact(buffer: Buffer, type: string): boolean {
    if (buffer.length < MIN_REALISTIC_FILE_SIZE) {
      return false;
    }

    const tailStart = Math.max(0, buffer.length - INTEGRITY_TAIL_BYTES);
    const tail = buffer.subarray(tailStart);

    if (type === 'pdf') {
      return this.containsSequence(tail, PDF_EOF_MARKER);
    }

    if (type === 'png') {
      return this.containsSequence(tail, PNG_IEND_CHUNK);
    }

    if (type === 'jpg') {
      return (
        tail[tail.length - 2] === JPG_EOI_BYTE_0 &&
        tail[tail.length - 1] === JPG_EOI_BYTE_1
      );
    }

    return false;
  }

  private containsSequence(haystack: Buffer, needle: Buffer): boolean {
    const limit = haystack.length - needle.length;
    for (let i = 0; i <= limit; i++) {
      if (needle.every((byte, offset) => haystack[i + offset] === byte)) {
        return true;
      }
    }
    return false;
  }
}

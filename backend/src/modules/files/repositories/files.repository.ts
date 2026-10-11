import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../prisma/client.js';
import { FileNotFoundException } from '../exceptions/index.js';

const FILE_METADATA_SELECT = {
  id: true,
  name: true,
  extension: true,
  mimeType: true,
  size: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FileSelect;

const FILE_CONTENT_SELECT = {
  name: true,
  extension: true,
  mimeType: true,
  content: true,
} satisfies Prisma.FileSelect;

interface NewFile {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  content: Buffer;
}

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewFile) {
    return this.prisma.file.create({
      data: { ...data, content: new Uint8Array(data.content) },
      select: FILE_METADATA_SELECT,
    });
  }

  findMetadataById(id: string) {
    return this.prisma.file.findUnique({ where: { id }, select: FILE_METADATA_SELECT });
  }

  findContentById(id: string) {
    return this.prisma.file.findUnique({ where: { id }, select: FILE_CONTENT_SELECT });
  }

  async delete(id: string) {
    try {
      // select evita leer content (hasta 10 MB) solo para descartarlo
      await this.prisma.file.delete({ where: { id }, select: { id: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new FileNotFoundException();
      }
      throw error;
    }
  }
}

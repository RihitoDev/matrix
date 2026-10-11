import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Prisma } from '../../../prisma/client.js';
import {
  AccessRequestCatalogMissingException,
  AccessRequestNotFoundException,
  ActiveAccessRequestExistsException,
  RequestCodeGenerationException,
} from '../exceptions/index.js';
import type { CreateAccessRequestDto } from '../requests/create-access-request.schema.js';
import type { UpdateAccessRequestDto } from '../requests/update-access-request.schema.js';
import { nextRequestCode, randomRetryDelayMs, requestCodePrefix, sleep } from '../helpers/request-code.js';
import { MAX_REQUEST_CODE_ATTEMPTS } from '../constants/request-code.constants.js';
import { isSubmittedDuplicate } from '../helpers/unique-violation.js';
import { ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import { ACCESS_REQUEST_SELECT, REQUEST_STATUS_SELECT, LIST_SELECT, DETAIL_SELECT } from '../constants/access-request-selects.constants.js';
import { ACTIVE_STATUSES, LISTED_STATUSES } from '../constants/access-request-status-groups.constants.js';

@Injectable()
export class AccessRequestsRepository {
  retryPause: (ms: number) => Promise<void> = sleep;

  constructor(private readonly prisma: PrismaService) {}

  // En el create, P2025 solo puede venir de un connect: la carrera o el estado no existen (seed sin correr)
  async createDraft(data: CreateAccessRequestDto) {
    const { career, ...rest } = data;
    try {
      return await this.prisma.accessRequest.create({
        data: {
          ...rest,
          status: { connect: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          career: { connect: { title: career } },
        },
        select: ACCESS_REQUEST_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AccessRequestCatalogMissingException();
      }
      throw error;
    }
  }

  async findPage(params: { status?: string; page: number; limit: number }) {
    const where: Prisma.AccessRequestWhereInput = {
      status: { title: params.status ?? { in: LISTED_STATUSES } },
    };
    const [rows, total] = await Promise.all([
      this.prisma.accessRequest.findMany({
        where,
        orderBy: [{ submittedAt: 'desc' }, { id: 'asc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: LIST_SELECT,
      }),
      this.prisma.accessRequest.count({ where }),
    ]);
    return { rows, total };
  }

  findDetailById(id: string) {
    return this.prisma.accessRequest.findUnique({ where: { id }, select: DETAIL_SELECT });
  }

  // Pasa de pending a in_review de forma atómica y registra quién la abrió y cuándo.
  // Devuelve false si la solicitud ya no estaba pendiente (P2025): no es un error, otra persona la abrió antes.
  async markInReview(id: string, reviewerId: string): Promise<boolean> {
    try {
      await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.PENDING } },
        data: {
          status: { connect: { title: ACCESS_REQUEST_STATUS.IN_REVIEW } },
          reviewedBy: { connect: { id: reviewerId } },
          reviewedAt: new Date(),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  // Dictamen atómico: solo desde in_review. Devuelve false si cambió de estado (P2025) para que el service responda 409
  async setVerdict(id: string, reviewerId: string, verdict: { status: string; rejectionReason?: string }): Promise<boolean> {
    try {
      await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.IN_REVIEW } },
        data: {
          status: { connect: { title: verdict.status } },
          reviewedBy: { connect: { id: reviewerId } },
          reviewedAt: new Date(),
          ...(verdict.rejectionReason !== undefined && { rejectionReason: verdict.rejectionReason }),
        },
        select: { id: true },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  findById(id: string) {
    return this.prisma.accessRequest.findUnique({ where: { id }, select: ACCESS_REQUEST_SELECT });
  }

  // Borradores y rechazadas no cuentan; excludeId evita chocar con la propia solicitud
  findActiveDuplicates(fields: { email?: string; idCardNumber?: string; sisCode?: string; excludeId?: string }) {
    const { email, idCardNumber, sisCode, excludeId } = fields;
    const matches: Prisma.AccessRequestWhereInput[] = [];
    if (email !== undefined) matches.push({ email: { equals: email, mode: 'insensitive' } });
    if (idCardNumber !== undefined) matches.push({ idCardNumber });
    if (sisCode !== undefined) matches.push({ sisCode });

    return this.prisma.accessRequest.findMany({
      where: {
        OR: matches,
        status: { title: { in: ACTIVE_STATUSES } },
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      select: { email: true, idCardNumber: true, sisCode: true },
    });
  }

  async updateDraft(id: string, data: UpdateAccessRequestDto) {
    const { career, ...rest } = data;
    try {
      return await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
        data: { ...rest, ...(career !== undefined && { career: { connect: { title: career } } }) },
        select: ACCESS_REQUEST_SELECT,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // P2025 puede venir de la solicitud (no existe o ya no es borrador) o de un connect anidado (carrera o estado sin sembrar).
        // En el segundo caso el runtime de Prisma agrega meta.model con el modelo relacionado que falló; en el primero no.
        // Es un detalle interno del runtime, no una API documentada.
        // TODO: confirmar el comportamiento de meta al actualizar Prisma
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  // Lee y actualiza dentro de una transacción para devolver el archivo anterior sin seleccionar nunca su contenido
  setDocument(id: string, fileId: string, documentType: string) {
    return this.replaceDocument(id, {
      documentFile: { connect: { id: fileId } },
      documentType: { connect: { title: documentType } },
    });
  }

  // documentTypeId es opcional en el schema, así que se limpia junto con el archivo
  clearDocument(id: string) {
    return this.replaceDocument(id, { documentFile: { disconnect: true }, documentType: { disconnect: true } });
  }

  private async replaceDocument(id: string, data: Prisma.AccessRequestUpdateInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const previous = await tx.accessRequest.findFirst({
          where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          select: { documentFileId: true },
        });
        await tx.accessRequest.update({
          where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
          data,
          select: { id: true },
        });
        return previous?.documentFileId ?? null;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Mismo criterio que updateDraft: meta.model indica un connect fallido (archivo o tipo de documento sin sembrar)
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  // Último código del año por orden descendente de texto: válido mientras los números tengan 4 dígitos
  // TODO: con más de 9999 solicitudes en un año el orden de texto deja de coincidir con el numérico
  async generateRequestCode(now: Date = new Date()) {
    const year = now.getUTCFullYear();
    const last = await this.prisma.accessRequest.findFirst({
      where: { requestCode: { startsWith: requestCodePrefix(year) } },
      orderBy: { requestCode: 'desc' },
      select: { requestCode: true },
    });
    return nextRequestCode(year, last?.requestCode);
  }

  // Los índices únicos parciales de la base (solo filas enviadas) son la defensa final contra envíos simultáneos con los mismos datos
  async submit(id: string, requestCode: string) {
    try {
      return await this.prisma.accessRequest.update({
        where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } },
        data: {
          requestCode,
          submittedAt: new Date(),
          status: { connect: { title: ACCESS_REQUEST_STATUS.PENDING } },
        },
        select: { id: true, requestCode: true, submittedAt: true, status: { select: { title: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        if (typeof error.meta?.model === 'string') {
          throw new AccessRequestCatalogMissingException();
        }
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }

  // Una ráfaga de envíos simultáneos calcula el mismo siguiente número; el unique de requestCode da P2002 a los perdedores.
  // Se recalcula con una pausa aleatoria breve y se reintenta. Un P2002 de correo, C.I. o SIS (índices únicos parciales)
  // significa que otra solicitud enviada ya ocupa esos datos: responde 409. Cualquier otro error se relanza de inmediato.
  async submitWithGeneratedCode(id: string) {
    for (let attempt = 1; attempt <= MAX_REQUEST_CODE_ATTEMPTS; attempt++) {
      const requestCode = await this.generateRequestCode();
      try {
        return await this.submit(id, requestCode);
      } catch (error) {
        const isCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!isCollision) throw error;
        if (isSubmittedDuplicate(error.meta)) throw new ActiveAccessRequestExistsException();
      }
      if (attempt < MAX_REQUEST_CODE_ATTEMPTS) await this.retryPause(randomRetryDelayMs());
    }
    throw new RequestCodeGenerationException();
  }

  // El correo va en el where (sin distinguir mayúsculas) para no seleccionarlo ni distinguir "código inexistente" de "correo distinto"
  findByRequestCode(requestCode: string, email: string) {
    return this.prisma.accessRequest.findFirst({
      where: { requestCode, email: { equals: email, mode: 'insensitive' } },
      select: REQUEST_STATUS_SELECT,
    });
  }

  async deleteDraft(id: string) {
    try {
      await this.prisma.accessRequest.delete({ where: { id, status: { title: ACCESS_REQUEST_STATUS.DRAFT } } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AccessRequestNotFoundException();
      }
      throw error;
    }
  }
}

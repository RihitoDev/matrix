import { Injectable } from '@nestjs/common';
import { FilesService } from '../../files/services/files.service.js';
import { FileNotFoundException } from '../../files/exceptions/index.js';
import { AuthService } from '../../auth/services/auth.service.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { ActivationOtpService } from './activation-otp.service.js';
import { RejectionNotificationService } from './rejection-notification.service.js';
import {
  AccessRequestNotEditableException,
  ActiveAccessRequestExistsException,
  DocumentRequiredToSubmitException,
  AccessRequestNotFoundException,
  DuplicateAccessRequestDataException,
  InvalidDocumentTypeException,
  InvalidGraduationYearException,
  MissingDocumentFileException,
  RequestDocumentNotFoundException,
  RequestNotInReviewException,
} from '../exceptions/index.js';
import { toAccessRequestResponse } from '../mappers/access-request.mapper.js';
import { toAccessRequestDetail } from '../mappers/access-request-detail.mapper.js';
import { toAccessRequestListItem } from '../mappers/access-request-list.mapper.js';
import type { ListAccessRequestsQuery } from '../requests/list-access-requests.schema.js';
import { toRequestStatusResponse } from '../mappers/request-status.mapper.js';
import { isGraduationYearCoherent } from '../requests/access-request-fields.js';
import type { CreateAccessRequestDto } from '../requests/create-access-request.schema.js';
import type { UpdateAccessRequestDto } from '../requests/update-access-request.schema.js';
import { ACCESS_REQUEST_DOCUMENT_TYPE, ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import type { AttachDocumentInput } from '../types/uploaded-file.types.js';
import { DUPLICATE_LABELS } from '../constants/duplicate-labels.constants.js';

type DuplicateField = keyof typeof DUPLICATE_LABELS;

@Injectable()
export class AccessRequestsService {
  constructor(
    private readonly accessRequestsRepository: AccessRequestsRepository,
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
    private readonly activationOtpService: ActivationOtpService,
    private readonly rejectionNotificationService: RejectionNotificationService,
  ) {}

  async create(dto: CreateAccessRequestDto) {
    await this.assertNoDuplicates(dto);
    const draft = await this.accessRequestsRepository.createDraft(dto);
    return { id: draft.id };
  }

  async update(id: string, dto: UpdateAccessRequestDto) {
    const current = await this.accessRequestsRepository.findById(id);
    if (!current) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotEditableException();
    }

    const graduationYear = dto.graduationYear ?? current.graduationYear;
    const birthDate = dto.birthDate ?? current.birthDate;
    if (!isGraduationYearCoherent(graduationYear, birthDate)) {
      throw new InvalidGraduationYearException();
    }

    await this.assertNoDuplicates(dto, id);

    const updated = await this.accessRequestsRepository.updateDraft(id, dto);
    return toAccessRequestResponse(updated);
  }

  async delete(id: string) {
    const current = await this.accessRequestsRepository.findById(id);
    if (!current) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotEditableException('La solicitud ya fue enviada y no se puede eliminar');
    }

    // TODO: primero se elimina la solicitud (condicional por estado draft) y después el archivo, para no destruir el documento de una solicitud enviada en una carrera.
    // Si falla el segundo paso queda un archivo huérfano que habrá que limpiar en el futuro.
    await this.accessRequestsRepository.deleteDraft(id);

    if (current.documentFileId) {
      try {
        await this.filesService.delete(current.documentFileId);
      } catch (error) {
        if (!(error instanceof FileNotFoundException)) {
          throw error;
        }
      }
    }

    return { id };
  }

  async attachDocument(id: string, input: AttachDocumentInput) {
    await this.findEditableDraft(id);

    const { file, documentType } = input;
    if (!file) {
      throw new MissingDocumentFileException();
    }
    // Se valida antes de crear el archivo para no dejar huérfanos por un tipo inválido
    if (!this.isDocumentType(documentType)) {
      throw new InvalidDocumentTypeException();
    }

    const created = await this.filesService.create({ name: file.originalname, content: file.buffer });

    let previousFileId: string | null;
    try {
      previousFileId = await this.accessRequestsRepository.setDocument(id, created.id, documentType);
    } catch (error) {
      await this.discardFile(created.id);
      throw error;
    }

    if (previousFileId && previousFileId !== created.id) {
      await this.discardFile(previousFileId);
    }

    return { id, documentFileId: created.id, documentType };
  }

  async removeDocument(id: string) {
    const current = await this.findEditableDraft(id);
    if (!current.documentFileId) {
      return { id, documentFileId: null };
    }

    const previousFileId = await this.accessRequestsRepository.clearDocument(id);
    if (previousFileId) {
      await this.discardFile(previousFileId);
    }

    return { id, documentFileId: null };
  }

  async submit(id: string) {
    const current = await this.findEditableDraft(id);
    if (!current.documentFileId || !current.documentType) {
      throw new DocumentRequiredToSubmitException();
    }

    if (await this.authService.existsByEmail(current.email)) {
      throw new DuplicateAccessRequestDataException('El correo ya está registrado');
    }
    const duplicates = await this.accessRequestsRepository.findActiveDuplicates({
      email: current.email,
      idCardNumber: current.idCardNumber,
      sisCode: current.sisCode,
      excludeId: id,
    });
    if (duplicates.length > 0) {
      throw new ActiveAccessRequestExistsException();
    }

    const submitted = await this.accessRequestsRepository.submitWithGeneratedCode(id);
    return {
      id: submitted.id,
      requestCode: submitted.requestCode,
      status: submitted.status.title,
      submittedAt: submitted.submittedAt?.toISOString() ?? null,
    };
  }

  async getDetail(id: string, reviewerId: string) {
    const current = await this.accessRequestsRepository.findDetailById(id);
    if (!current || current.status.title === ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.PENDING) {
      return toAccessRequestDetail(current);
    }

    await this.accessRequestsRepository.markInReview(id, reviewerId);
    const updated = await this.accessRequestsRepository.findDetailById(id);
    if (!updated) {
      throw new AccessRequestNotFoundException();
    }
    return toAccessRequestDetail(updated);
  }

  // Solo se aprueba desde in_review; el código de activación se emite después y su fallo no revierte la aprobación
  async approve(id: string, reviewerId: string) {
    const current = await this.accessRequestsRepository.findDetailById(id);
    if (!current || current.status.title === ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.IN_REVIEW) {
      throw new RequestNotInReviewException();
    }

    const updated = await this.accessRequestsRepository.setVerdict(id, reviewerId, { status: ACCESS_REQUEST_STATUS.APPROVED });
    if (!updated) {
      throw new RequestNotInReviewException();
    }

    const activationCodeSent = await this.activationOtpService.issueFor(id, current.email);
    return { id, status: ACCESS_REQUEST_STATUS.APPROVED, activationCodeSent };
  }

  // Solo se rechaza desde in_review y con motivo; el aviso por correo se envía después y su fallo no revierte el rechazo
  async reject(id: string, reviewerId: string, reason: string) {
    const current = await this.accessRequestsRepository.findDetailById(id);
    if (!current || current.status.title === ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.IN_REVIEW) {
      throw new RequestNotInReviewException();
    }

    const updated = await this.accessRequestsRepository.setVerdict(id, reviewerId, {
      status: ACCESS_REQUEST_STATUS.REJECTED,
      rejectionReason: reason,
    });
    if (!updated) {
      throw new RequestNotInReviewException();
    }

    const notificationSent = await this.rejectionNotificationService.notify(current.email, reason, id);
    return { id, status: ACCESS_REQUEST_STATUS.REJECTED, rejectionReason: reason, notificationSent };
  }

  async getDocument(id: string) {
    const current = await this.accessRequestsRepository.findDetailById(id);
    if (!current || current.status.title === ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotFoundException();
    }
    if (!current.documentFileId) {
      throw new RequestDocumentNotFoundException();
    }
    return this.filesService.getContent(current.documentFileId);
  }

  // Forma { data, page, offset } del contrato paginado; el total viaja dentro de data
  async list(query: ListAccessRequestsQuery) {
    const { rows, total } = await this.accessRequestsRepository.findPage(query);
    return {
      data: { items: rows.map(toAccessRequestListItem), total },
      page: query.page,
      offset: (query.page - 1) * query.limit,
    };
  }

  // Un código inexistente y un correo distinto dan el mismo 404 para no revelar si la solicitud existe
  async getStatus(requestCode: string, email: string) {
    const found = await this.accessRequestsRepository.findByRequestCode(requestCode, email.trim().toLowerCase());
    if (!found) {
      throw new AccessRequestNotFoundException();
    }
    return toRequestStatusResponse(found);
  }

  private async findEditableDraft(id: string) {
    const current = await this.accessRequestsRepository.findById(id);
    if (!current) {
      throw new AccessRequestNotFoundException();
    }
    if (current.status.title !== ACCESS_REQUEST_STATUS.DRAFT) {
      throw new AccessRequestNotEditableException();
    }
    return current;
  }

  private isDocumentType(value: string | undefined): value is string {
    return Object.values<string>(ACCESS_REQUEST_DOCUMENT_TYPE).includes(value as string);
  }

  // Un fallo al borrar no debe romper la operación principal: el archivo queda huérfano
  // TODO: limpiar archivos huérfanos si falla el borrado del anterior
  private async discardFile(fileId: string) {
    try {
      await this.filesService.delete(fileId);
    } catch {
      // FileNotFoundException u otro error: se ignora a propósito (ver TODO)
    }
  }

  private async assertNoDuplicates(
    dto: { email?: string; idCardNumber?: string; sisCode?: string },
    excludeId?: string,
  ) {
    const { email, idCardNumber, sisCode } = dto;
    if (email === undefined && idCardNumber === undefined && sisCode === undefined) return;

    const duplicated = new Set<DuplicateField>();

    if (email !== undefined && (await this.authService.existsByEmail(email))) {
      duplicated.add('email');
    }

    const requests = await this.accessRequestsRepository.findActiveDuplicates({ email, idCardNumber, sisCode, excludeId });
    for (const request of requests) {
      if (email !== undefined && request.email.toLowerCase() === email.toLowerCase()) duplicated.add('email');
      if (idCardNumber !== undefined && request.idCardNumber === idCardNumber) duplicated.add('idCardNumber');
      if (sisCode !== undefined && request.sisCode === sisCode) duplicated.add('sisCode');
    }

    if (duplicated.size === 0) return;

    const labels = (Object.keys(DUPLICATE_LABELS) as DuplicateField[])
      .filter((field) => duplicated.has(field))
      .map((field) => DUPLICATE_LABELS[field]);
    const list = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} y ${labels.at(-1)}` : labels[0];
    const message = `${list.charAt(0).toUpperCase()}${list.slice(1)} ya ${labels.length > 1 ? 'están registrados' : 'está registrado'}`;
    throw new DuplicateAccessRequestDataException(message);
  }
}

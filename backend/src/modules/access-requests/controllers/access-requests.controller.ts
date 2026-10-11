import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import { MAX_FILE_SIZE_BYTES } from '../../files/constants/file-rules.constants.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { rejectAccessRequestSchema, type RejectAccessRequestDto } from '../requests/reject-access-request.schema.js';
import { listAccessRequestsQuerySchema, type ListAccessRequestsQuery } from '../requests/list-access-requests.schema.js';
import { DocumentUploadInterceptor } from '../interceptors/document-upload.interceptor.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { createAccessRequestSchema, type CreateAccessRequestDto } from '../requests/create-access-request.schema.js';
import { attachDocumentSchema, type AttachDocumentDto } from '../requests/attach-document.schema.js';
import type { UploadedDocumentFile } from '../types/uploaded-file.types.js';
import {
  requestStatusParamsSchema,
  requestStatusQuerySchema,
  type RequestStatusParams,
  type RequestStatusQuery,
} from '../requests/request-status.schema.js';
import { updateAccessRequestSchema, type UpdateAccessRequestDto } from '../requests/update-access-request.schema.js';
import { BACKOFFICE_ROLE } from '../constants/backoffice.constants.js';

interface DocumentResponse {
  set: (headers: Record<string, string>) => unknown;
  end: (body: Buffer) => unknown;
}

const uuidPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('El identificador de la solicitud no es válido'),
});

@Controller('access-requests')
export class AccessRequestsController {
  constructor(private readonly accessRequestsService: AccessRequestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BACKOFFICE_ROLE)
  list(@Query(new ZodValidationPipe(listAccessRequestsQuerySchema)) query: ListAccessRequestsQuery) {
    return this.accessRequestsService.list(query);
  }

  // Se declara antes que cualquier ruta con :id para que "status" no se tome como identificador
  // TODO: reemplazar el correo en la URL cuando Pablo defina la autenticación (los parámetros de consulta quedan en los logs)
  @Get('status/:code')
  getStatus(
    @Param(new ZodValidationPipe(requestStatusParamsSchema)) params: RequestStatusParams,
    @Query(new ZodValidationPipe(requestStatusQuerySchema)) query: RequestStatusQuery,
  ) {
    return this.accessRequestsService.getStatus(params.code, query.email);
  }

  // El documento se entrega como binario con su tipo de contenido; el cuerpo nunca pasa por el formato JSON
  @Get(':id/document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BACKOFFICE_ROLE)
  async getDocument(@Param('id', uuidPipe) id: string, @Res() response: DocumentResponse): Promise<void> {
    const file = await this.accessRequestsService.getDocument(id);
    response.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.content.length),
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(`${file.name}.${file.extension}`)}`,
    });
    response.end(file.content);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BACKOFFICE_ROLE)
  getDetail(@Param('id', uuidPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.getDetail(id, user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BACKOFFICE_ROLE)
  approve(@Param('id', uuidPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessRequestsService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(BACKOFFICE_ROLE)
  reject(
    @Param('id', uuidPipe) id: string,
    @Body(new ZodValidationPipe(rejectAccessRequestSchema)) body: RejectAccessRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accessRequestsService.reject(id, user.id, body.reason);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createAccessRequestSchema)) body: CreateAccessRequestDto) {
    return this.accessRequestsService.create(body);
  }

  @Patch(':id')
  update(@Param('id', uuidPipe) id: string, @Body(new ZodValidationPipe(updateAccessRequestSchema)) body: UpdateAccessRequestDto) {
    return this.accessRequestsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', uuidPipe) id: string) {
    return this.accessRequestsService.delete(id);
  }

  // DocumentUploadInterceptor va primero para envolver y traducir el error de Multer
  @Post(':id/document')
  @UseInterceptors(DocumentUploadInterceptor, FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  attachDocument(
    @Param('id', uuidPipe) id: string,
    @UploadedFile() file: UploadedDocumentFile | undefined,
    @Body(new ZodValidationPipe(attachDocumentSchema)) body: AttachDocumentDto,
  ) {
    return this.accessRequestsService.attachDocument(id, { file, documentType: body.documentType });
  }

  @Post(':id/submit')
  submit(@Param('id', uuidPipe) id: string) {
    return this.accessRequestsService.submit(id);
  }

  @Delete(':id/document')
  removeDocument(@Param('id', uuidPipe) id: string) {
    return this.accessRequestsService.removeDocument(id);
  }
}

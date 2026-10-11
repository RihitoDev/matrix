import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';
import {
  CERTIFICATION_DOCUMENT_FIELD_NAME,
  CERTIFICATION_DOCUMENT_UPLOAD_LIMIT_BYTES,
} from '../constants/certification-document.constants.js';
import { CertificationDocumentsService } from '../services/certification-documents.service.js';
import type { CertificationResponse } from '../../certifications/types/certification-response.type.js';

@ApiTags('certifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('certifications/:id/document')
export class CertificationDocumentsController {
  constructor(
    private readonly certificationDocumentsService: CertificationDocumentsService,
  ) {}

  @Put()
  @UseInterceptors(
    FileInterceptor(CERTIFICATION_DOCUMENT_FIELD_NAME, {
      limits: {
        fileSize: CERTIFICATION_DOCUMENT_UPLOAD_LIMIT_BYTES,
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [CERTIFICATION_DOCUMENT_FIELD_NAME],
      properties: {
        [CERTIFICATION_DOCUMENT_FIELD_NAME]: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  upload(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: MulterFile | undefined,
  ): Promise<CertificationResponse> {
    return this.certificationDocumentsService.upload(userId, id, file);
  }

  @Delete()
  async remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<null> {
    await this.certificationDocumentsService.remove(userId, id);
    return null;
  }
}

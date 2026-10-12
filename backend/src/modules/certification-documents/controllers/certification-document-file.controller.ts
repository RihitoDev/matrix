import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CertificationDocumentsService } from '../services/certification-documents.service.js';

@ApiTags('certifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@UseGuards(JwtAuthGuard)
@Controller('certifications/:id/document')
export class CertificationDocumentFileController {
  constructor(
    private readonly certificationDocumentsService: CertificationDocumentsService,
  ) {}

  @Get()
  @ApiProduces('application/pdf', 'image/png', 'image/jpeg')
  async download(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const download = await this.certificationDocumentsService.getFile(
      userId,
      id,
    );

    return new StreamableFile(download.content, {
      type: download.mimeType,
      disposition: `inline; filename="${download.fileName}"`,
      length: download.content.length,
    });
  }
}

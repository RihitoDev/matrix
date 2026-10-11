import { Controller, Get, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CvService } from '../services/cv.service.js';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile/me/cv/file')
export class CvFileController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  @ApiProduces('application/pdf')
  async download(@CurrentUserId() userId: string): Promise<StreamableFile> {
    const download = await this.cvService.getFile(userId);

    return new StreamableFile(download.content, {
      type: download.mimeType,
      disposition: `inline; filename="${download.fileName}"`,
      length: download.content.length,
    });
  }
}

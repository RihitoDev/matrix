import {
  Controller,
  Delete,
  Get,
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
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import {
  CV_FIELD_NAME,
  CV_UPLOAD_LIMIT_BYTES,
} from '../constants/cv.constants.js';
import type { CvResponse } from '../responses/cv.response.js';
import { CvService } from '../services/cv.service.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('profile/me/cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  getMetadata(@CurrentUserId() userId: string): Promise<CvResponse | null> {
    return this.cvService.getMetadata(userId);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor(CV_FIELD_NAME, {
      limits: { fileSize: CV_UPLOAD_LIMIT_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [CV_FIELD_NAME],
      properties: {
        [CV_FIELD_NAME]: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(
    @CurrentUserId() userId: string,
    @UploadedFile() file: MulterFile | undefined,
  ): Promise<CvResponse | null> {
    return this.cvService.upload(userId, file);
  }

  @Delete()
  async remove(@CurrentUserId() userId: string): Promise<null> {
    await this.cvService.remove(userId);
    return null;
  }
}

import {
  Controller,
  Delete,
  Get,
  Put,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import type { ProfilePhotoResponse } from '../responses/profile-photo.response.js';
import { ProfilePhotoService } from '../services/profile-photo.service.js';
import type { MulterFile } from '../../../common/types/multer-file.type.js';

const uploadFieldName = 'file';

const uploadSizeLimitBytes = 10 * 1024 * 1024;

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile/me/photo')
export class ProfilePhotoController {
  constructor(private readonly profilePhotoService: ProfilePhotoService) {}

  @Get()
  @ApiProduces('image/png', 'image/jpeg')
  async download(@CurrentUserId() userId: string): Promise<StreamableFile> {
    const photo = await this.profilePhotoService.getPhoto(userId);

    return new StreamableFile(photo.content, {
      type: photo.mimeType,
      disposition: 'inline',
      length: photo.content.length,
    });
  }

  @Put()
  @UseInterceptors(
    ResponseInterceptor,
    FileInterceptor(uploadFieldName, {
      limits: { fileSize: uploadSizeLimitBytes, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [uploadFieldName],
      properties: {
        [uploadFieldName]: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Saved photo metadata' })
  upload(
    @CurrentUserId() userId: string,
    @UploadedFile() file: MulterFile | undefined,
  ): Promise<ProfilePhotoResponse> {
    return this.profilePhotoService.upload(userId, file);
  }

  @Delete()
  @UseInterceptors(ResponseInterceptor)
  async remove(@CurrentUserId() userId: string): Promise<null> {
    await this.profilePhotoService.remove(userId);
    return null;
  }
}

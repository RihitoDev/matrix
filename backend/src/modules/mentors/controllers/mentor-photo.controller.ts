import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { MentorPhotoService } from '../services/mentor-photo.service.js';

@ApiTags('mentors')
@Controller('mentors')
export class MentorPhotoController {
  constructor(private readonly mentorPhotoService: MentorPhotoService) {}

  @Get(':userId/photo')
  @Header('Cache-Control', 'no-store')
  @ApiProduces('image/png', 'image/jpeg')
  async download(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Promise<StreamableFile> {
    const photo = await this.mentorPhotoService.getPhoto(userId);

    return new StreamableFile(photo.content, {
      type: photo.mimeType,
      disposition: 'inline',
      length: photo.content.length,
    });
  }
}

import { Module } from '@nestjs/common';
import { FilesService } from './services/files.service.js';
import { FilesRepository } from './repositories/files.repository.js';

@Module({
  providers: [FilesService, FilesRepository],
  exports: [FilesService],
})
export class FilesModule {}

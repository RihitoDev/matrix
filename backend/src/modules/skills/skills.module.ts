import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { ProfileModule } from '../profile/profile.module.js';
import { SkillController } from './controllers/skill.controller.js';
import { UserSkillController } from './controllers/user-skill.controller.js';
import { SkillMapper } from './mappers/skill.mapper.js';
import { SkillRepository } from './repositories/skill.repository.js';
import { UserSkillRepository } from './repositories/user-skill.repository.js';
import { SkillCatalogService } from './services/skill-catalog.service.js';
import { UserSkillService } from './services/user-skill.service.js';

@Module({
  imports: [PrismaModule, JwtAuthModule, ProfileModule],
  controllers: [SkillController, UserSkillController],
  providers: [
    SkillCatalogService,
    UserSkillService,
    SkillRepository,
    UserSkillRepository,
    SkillMapper,
  ],
  exports: [SkillCatalogService, UserSkillService],
})
export class SkillsModule {}

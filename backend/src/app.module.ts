import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { AccessRequestsModule } from './modules/access-requests/access-requests.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AvailabilityModule } from './modules/availability/availability.module.js';
import { CertificationDocumentsModule } from './modules/certification-documents/certification-documents.module.js';
import { CertificationsModule } from './modules/certifications/certifications.module.js';
import { CvModule } from './modules/cv/cv.module.js';
import { EducationsModule } from './modules/educations/educations.module.js';
import { JobOffersModule } from './modules/job-offers/job-offers.module.js';
import { MentorsModule } from './modules/mentors/mentors.module.js';
import { OrientationTypesModule } from './modules/orientation-types/orientation-types.module.js';
import { ProfileModule } from './modules/profile/profile.module.js';
import { SkillsModule } from './modules/skills/skills.module.js';
import { TechnicalAreasModule } from './modules/technical-areas/technical-areas.module.js';
import { WorkExperienceModule } from './modules/work-experience/work-experience.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AvailabilityModule,
    AuthModule,
    ProfileModule,
    CvModule,
    SkillsModule,
    JobOffersModule,
    EducationsModule,
    WorkExperienceModule,
    CertificationsModule,
    CertificationDocumentsModule,
    TechnicalAreasModule,
    OrientationTypesModule,
    MentorsModule,
    AccessRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter }, // mapea Zod a 422
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
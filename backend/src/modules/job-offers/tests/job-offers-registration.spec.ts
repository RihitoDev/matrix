import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants.js';
import { describe, expect, it } from 'vitest';
import { AppModule } from '../../../app.module.js';
import { JobOffersModule } from '../job-offers.module.js';

describe('JobOffersModule registration', () => {
  it('is imported by AppModule so its routes are exposed', () => {
    const imports: unknown[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, AppModule);

    expect(imports).toContain(JobOffersModule);
  });
});

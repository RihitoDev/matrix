import { createZodDto } from 'nestjs-zod';
import { buildCreateBlockSchema } from './create-block.request.js';

export const updateBlockSchema = buildCreateBlockSchema();

export class UpdateBlockDto extends createZodDto(updateBlockSchema) {}

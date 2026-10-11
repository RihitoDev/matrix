import { z } from 'zod';
import { BLOCK_ID_MESSAGES } from '../constants/block-id.constants.js';

export const blockIdSchema = z.uuid({ error: BLOCK_ID_MESSAGES.invalidId });

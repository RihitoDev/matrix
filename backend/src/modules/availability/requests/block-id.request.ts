import { z } from 'zod';

export const blockIdSchema = z.uuid({ error: 'El id del bloque no es válido' });

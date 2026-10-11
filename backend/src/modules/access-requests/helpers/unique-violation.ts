import { SUBMITTED_UNIQUE_INDEXES } from '../constants/unique-indexes.constants.js';

// Nombre del índice o restricción violada en un P2002. Con el adaptador pg viene en
// meta.driverAdapterError.cause.constraint.index; con el motor clásico, en meta.target.
// TODO: revisar esta forma si cambia el runtime o el adaptador de Prisma
export function violatedConstraints(meta: unknown): string[] {
  if (typeof meta !== 'object' || meta === null) return [];
  const { driverAdapterError, target } = meta as {
    driverAdapterError?: { cause?: { constraint?: { index?: unknown; fields?: unknown } } };
    target?: unknown;
  };
  const constraint = driverAdapterError?.cause?.constraint;
  const names: unknown[] = [constraint?.index, ...(Array.isArray(constraint?.fields) ? constraint.fields : []), target];
  return names.flat().filter((name): name is string => typeof name === 'string');
}

export function isSubmittedDuplicate(meta: unknown): boolean {
  return violatedConstraints(meta).some((name) => (SUBMITTED_UNIQUE_INDEXES as readonly string[]).includes(name));
}

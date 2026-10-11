import { OVERLAP_ERROR_CODE } from '../constants/create-block.constants.js';

export const hasOverlapErrorCode = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    meta?: { code?: unknown; driverAdapterError?: { cause?: { code?: unknown } } };
    message?: unknown;
  };

  if (candidate.code === OVERLAP_ERROR_CODE) {
    return true;
  }

  if (typeof candidate.meta === 'object' && candidate.meta !== null) {
    if (candidate.meta.code === OVERLAP_ERROR_CODE) {
      return true;
    }
    if (candidate.meta.driverAdapterError?.cause?.code === OVERLAP_ERROR_CODE) {
      return true;
    }
  }

  return typeof candidate.message === 'string' && candidate.message.includes(OVERLAP_ERROR_CODE);
};

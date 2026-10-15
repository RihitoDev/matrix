import { Logger } from '@nestjs/common';

const logger = new Logger('Seed');

export async function runSeedStage<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = performance.now();
  logger.log(`Iniciando etapa: ${name}`);
  try {
    const result = await operation();
    logger.log(
      `Etapa ${name} completada en ${Math.round(performance.now() - startedAt)} ms`,
    );
    return result;
  } catch (error) {
    logger.error(
      `Etapa ${name} falló tras ${Math.round(performance.now() - startedAt)} ms`,
    );
    throw error;
  }
}

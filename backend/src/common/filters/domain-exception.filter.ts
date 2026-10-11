import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';
import { DomainException } from '../exceptions/domain.exception.js';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      data: exception.data,
      detail: exception.message,
      ok: false,
      ...(exception instanceof RequestValidationException && {
        errors: exception.errors,
      }),
    });
  }
}

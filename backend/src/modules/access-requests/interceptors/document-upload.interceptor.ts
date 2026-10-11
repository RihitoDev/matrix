import { CallHandler, ExecutionContext, Injectable, NestInterceptor, PayloadTooLargeException } from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { FileTooLargeException } from '../../files/exceptions/index.js';

// Traduce el 413 de Multer a una excepción de dominio; debe declararse antes que FileInterceptor
@Injectable()
export class DocumentUploadInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) =>
        throwError(() => (error instanceof PayloadTooLargeException ? new FileTooLargeException() : error)),
      ),
    );
  }
}

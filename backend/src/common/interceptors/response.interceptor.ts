import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { AlreadyFormatted } from '../types/already-formatted.types.js';
import type { PaginatedPayload } from '../types/paginated-payload.types.js';

function isPaginatedPayload(value: unknown): value is PaginatedPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'page' in value &&
    'offset' in value
  );
}

function isAlreadyFormatted(value: unknown): value is AlreadyFormatted {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'ok' in value &&
    'detail' in value &&
    'data' in value
  );
}

@Injectable()
export class ResponseInterceptor<T = unknown> implements NestInterceptor<T> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const http = context.switchToHttp();
    const response = http.getResponse<{ statusCode?: number }>();
    const statusCode = response?.statusCode ?? 200;
    const request =
      typeof http.getRequest === 'function'
        ? http.getRequest<{ url?: string }>()
        : undefined;

    const isEpic2Route =
      typeof request?.url === 'string' &&
      (request.url.includes('/profile') ||
        request.url.includes('/certifications') ||
        request.url.includes('/skills') ||
        request.url.includes('/educations') ||
        request.url.includes('/work-experience'));

    const detail = isEpic2Route ? 'OK' : 'Operación exitosa';

    return next.handle().pipe(
      map((value: unknown) => {
        if (value instanceof StreamableFile || isAlreadyFormatted(value)) {
          return value;
        }

        if (isPaginatedPayload(value)) {
          return {
            statusCode,
            ok: true,
            detail,
            data: value.data ?? null,
            page: value.page,
            offset: value.offset,
          };
        }

        return {
          statusCode,
          ok: true,
          detail,
          data: value ?? null,
        };
      }),
    );
  }
}

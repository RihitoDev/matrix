import { RequestValidationException } from '../exceptions/request-validation.exception.js';
import type { ValidationIssue } from '../types/validation-issue.type.js';

function formatPath(path: ValidationIssue['path']): string {
  return (path ?? [])
    .map((segment) => (typeof segment === 'object' ? segment.key : segment))
    .map(String)
    .join('.');
}

export function buildRequestValidationException(
  issues: readonly ValidationIssue[],
): RequestValidationException {
  return new RequestValidationException(
    issues.map((issue) => ({ field: formatPath(issue.path), message: issue.message })),
  );
}

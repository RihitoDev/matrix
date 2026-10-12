import type {
  RegisteredUserResponse,
  RejectedUserResponse,
  ReportUser,
} from '../types/report-user.types.js';

export function toRegisteredUserResponse(
  user: ReportUser,
): RegisteredUserResponse {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    userType: user.userType,
    identifier: user.identifier,
    documentType: user.documentType,
    registeredAt: user.registeredAt,
  };
}

export function toRejectedUserResponse(user: ReportUser): RejectedUserResponse {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    identifier: user.identifier,
    documentType: user.documentType,
    rejectionReason: user.rejectionReason,
    registeredAt: user.registeredAt,
  };
}

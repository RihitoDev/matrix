import type { CreateCertificationDto } from "./create-certification-dto.types";

export type CertificationErrors = Partial<Record<keyof CreateCertificationDto, string>>;

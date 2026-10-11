import type { MODALITIES, CONTRACT_TYPES } from "../constants/vacancies.constants";

export type Modality = (typeof MODALITIES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];

/** Cuerpo que espera POST /v1/empresas/:empresaId/ofertas (create-job-offer.schema.ts del backend). */
export interface CreateJobOfferPayload {
  tituloPuesto: string;
  descripcion: string;
  modalidad: Modality;
  tipoContrato: ContractType;
  categoria: string;
  numeroVacantes: number;
  salarioMin: number;
  salarioMax?: number;
  idiomas: string;
  enlaceGoogleMaps: string;
  tecnologias: string[];
}

export interface CreateJobOfferResponse {
  id: string;
  fechaCreacion: string;
  mensaje: string;
}

export type PublishErrorKind = "network" | "validation" | "company" | "session" | "server";

export interface PublishError {
  kind: PublishErrorKind;
  message: string;
  details: string[];
}

export interface CurrentCompany {
  id: string | null;
  name: string;
  initials: string;
}

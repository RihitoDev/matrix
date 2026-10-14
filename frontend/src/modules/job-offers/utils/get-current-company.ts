import { COMPANY_ROLE_TAG, DEFAULT_COMPANY_ID, DEFAULT_COMPANY_NAME } from "../constants/vacancies.constants";
import type { CurrentCompany } from "../types/job-offer.types";
import { getSessionRoleTag } from "./get-session-role-tag";

function getInitials(name: string): string {
  const capitals = name.match(/[A-ZÁÉÍÓÚÑ]/g) ?? [];
  return capitals.slice(0, 2).join("") || name.slice(0, 2).toUpperCase();
}

// TODO: obtener la empresa desde la sesión cuando el login devuelva el companyId (Epic 1)
export function getCurrentCompany(): CurrentCompany {
  const name = process.env.NEXT_PUBLIC_DEMO_COMPANY_NAME?.trim() || DEFAULT_COMPANY_NAME;
  const isCompanySession = getSessionRoleTag() === COMPANY_ROLE_TAG;
  const id = isCompanySession ? process.env.NEXT_PUBLIC_DEMO_COMPANY_ID?.trim() || DEFAULT_COMPANY_ID : null;

  return { id, name, initials: getInitials(name) };
}

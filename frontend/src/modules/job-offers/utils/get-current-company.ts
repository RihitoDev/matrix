import { DEFAULT_COMPANY_NAME } from "../constants/vacancies.constants";
import type { CurrentCompany } from "../types/job-offer.types";

function getInitials(name: string): string {
  const capitals = name.match(/[A-ZÁÉÍÓÚÑ]/g) ?? [];
  return capitals.slice(0, 2).join("") || name.slice(0, 2).toUpperCase();
}

// TODO: obtener la empresa desde la sesión cuando el login devuelva el companyId (Epic 1)
export function getCurrentCompany(): CurrentCompany {
  const id = process.env.NEXT_PUBLIC_DEMO_COMPANY_ID?.trim() || null;
  const name = process.env.NEXT_PUBLIC_DEMO_COMPANY_NAME?.trim() || DEFAULT_COMPANY_NAME;

  return { id, name, initials: getInitials(name) };
}

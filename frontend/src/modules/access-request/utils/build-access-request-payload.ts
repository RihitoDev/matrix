import type { Career } from "../constants/careers.constants";
import type { IdCardIssuedIn } from "../constants/id-card-issued-in.constants";
import type { AccessRequestPayload, PersonalDataValues } from "../types/access-request.types";

// Se asume que los valores ya pasaron validatePersonalData
export function buildAccessRequestPayload(
  values: PersonalDataValues,
  mode: "create" | "update",
): AccessRequestPayload {
  const phone = (values.phone ?? "").trim();
  const payload: AccessRequestPayload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    idCardNumber: values.idCardNumber.trim(),
    idCardIssuedIn: values.idCardIssuedIn as IdCardIssuedIn,
    sisCode: values.sisCode.trim(),
    email: values.email.trim(),
    birthDate: values.birthDate.trim(),
    graduationYear: Number(values.graduationYear.trim()),
    career: values.career as Career,
  };

  // El backend rechaza "" en phone: en POST se omite la clave y en PATCH se envía null para borrarlo
  if (phone.length > 0) return { ...payload, phone };
  if (mode === "update") return { ...payload, phone: null };
  return payload;
}

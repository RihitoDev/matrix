import { BUSINESS_TIMEZONE } from "@/modules/profile/constants/validation.constants";

export function getTodayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

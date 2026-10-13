import { FIRST_ACADEMIC_YEAR, FIRST_SEMESTER_LAST_MONTH } from "../constants/academic-period.constants";
import type { AcademicPeriod } from "../types/registered-user.types";

const YEAR_MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/La_Paz",
  year: "numeric",
  month: "numeric",
});

export function getAcademicPeriods(today = new Date(), firstYear = FIRST_ACADEMIC_YEAR): AcademicPeriod[] {
  const parts = YEAR_MONTH_FORMATTER.formatToParts(today);
  const currentYear = Number(parts.find((part) => part.type === "year")?.value);
  const currentMonth = Number(parts.find((part) => part.type === "month")?.value);
  const isSecondSemester = currentMonth > FIRST_SEMESTER_LAST_MONTH;
  const periods: AcademicPeriod[] = [];

  for (let year = currentYear; year >= firstYear; year--) {
    if (year < currentYear || isSecondSemester) {
      periods.push(`II-${year}`);
    }
    periods.push(`I-${year}`);
  }

  return periods;
}

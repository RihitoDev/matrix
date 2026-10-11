import { SHORT_MONTH_LABELS } from "@/modules/profile/config/short-month-labels.config";
import { CURRENT_JOB_LABEL } from "../constants/work-experience.constants";

function getMonthAndYear(yearMonth: string): { month: string; year: string } {
  const [year, month] = yearMonth.split("-");
  const label = SHORT_MONTH_LABELS[Number(month) - 1];
  return { month: label.charAt(0).toUpperCase() + label.slice(1), year };
}

export function formatWorkPeriod(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const start = getMonthAndYear(startDate);
  if (isCurrent || !endDate) {
    return `${start.month} ${start.year} – ${CURRENT_JOB_LABEL}`;
  }
  const end = getMonthAndYear(endDate);
  if (start.year === end.year) {
    return `${start.month} – ${end.month} ${end.year}`;
  }
  return `${start.month} ${start.year} – ${end.month} ${end.year}`;
}
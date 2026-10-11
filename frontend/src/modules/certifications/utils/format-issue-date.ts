import { SHORT_MONTH_LABELS } from "@/modules/profile/config/short-month-labels.config";

export function formatIssueDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthLabel = SHORT_MONTH_LABELS[Number(month) - 1];
  return `${Number(day)} ${monthLabel} ${year}`;
}

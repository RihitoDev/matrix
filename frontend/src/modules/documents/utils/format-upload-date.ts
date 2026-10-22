import { SHORT_MONTH_LABELS } from "@/modules/profile";

export function formatUploadDate(date: Date): string {
  return `${date.getDate()} ${SHORT_MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

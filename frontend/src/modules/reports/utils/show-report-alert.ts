import { toast } from "sonner";
import { REPORT_ALERT_DURATION_MS } from "../constants/reports.constants";
import type { ReportAlert } from "../types/report-alert.types";

export function showReportAlert({ variant, message }: ReportAlert, id: string) {
  const show = variant === "warning" ? toast.warning : toast.error;

  show(message, { id, duration: REPORT_ALERT_DURATION_MS, closeButton: true, richColors: true });
}

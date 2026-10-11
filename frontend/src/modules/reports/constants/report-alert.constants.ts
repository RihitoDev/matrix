import type { ReportAlertVariant } from "../types/report-alert-toast-props.types";

export const REPORT_ALERT_VARIANT_STYLES: Record<ReportAlertVariant, { container: string; icon: string }> = {
  warning: { container: "border-amber-500 bg-amber-50", icon: "text-amber-600" },
  error: { container: "border-red-500 bg-red-50", icon: "text-red-600" },
};

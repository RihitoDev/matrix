import { TriangleAlert, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPORT_ALERT_VARIANT_STYLES } from "../constants/report-alert.constants";
import type { ReportAlertToastProps } from "../types/report-alert-toast-props.types";

export function ReportAlertToast({ variant, message }: ReportAlertToastProps) {
  if (!message) {
    return null;
  }

  const styles = REPORT_ALERT_VARIANT_STYLES[variant];
  const Icon = variant === "error" ? WifiOff : TriangleAlert;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <p
        role={variant === "error" ? "alert" : "status"}
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={cn(
          "flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium text-ink shadow-md animate-in fade-in slide-in-from-top-2",
          styles.container,
        )}
      >
        <Icon className={cn("size-5 shrink-0", styles.icon)} strokeWidth={2} aria-hidden="true" />
        {message}
      </p>
    </div>
  );
}
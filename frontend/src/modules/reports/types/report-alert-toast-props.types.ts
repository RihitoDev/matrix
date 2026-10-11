export type ReportAlertVariant = "warning" | "error";

export interface ReportAlertToastProps {
  variant: ReportAlertVariant;
  message?: string;
}

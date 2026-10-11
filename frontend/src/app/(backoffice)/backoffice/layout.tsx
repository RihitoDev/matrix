import type { ReactNode } from "react";
import { BackofficeShell } from "@/modules/request-review";

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return <BackofficeShell>{children}</BackofficeShell>;
}

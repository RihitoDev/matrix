import type { ReactNode } from "react";
import { AppRouteLayout } from "@/shared/components/layout";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppRouteLayout>{children}</AppRouteLayout>;
}

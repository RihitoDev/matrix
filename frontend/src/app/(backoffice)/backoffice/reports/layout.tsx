import type { ReactNode } from "react";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <div className="px-8 pb-8 md:pt-8">{children}</div>;
}

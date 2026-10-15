import type { Metadata } from "next";
import { RequestInboxView } from "@/modules/request-review";

export const metadata: Metadata = {
  title: "Solicitudes de acceso",
};

export default function RequestInboxPage() {
  return <RequestInboxView />;
}

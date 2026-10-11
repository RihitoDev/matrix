import type { Metadata } from "next";
import { RequestAccessView } from "@/modules/access-request";

export const metadata: Metadata = {
  title: "Solicitud de acceso",
};

export default function RequestAccessPage() {
  return <RequestAccessView />;
}

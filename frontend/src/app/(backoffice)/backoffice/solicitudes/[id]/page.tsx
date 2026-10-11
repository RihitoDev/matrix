import type { Metadata } from "next";
import { RequestDetailView } from "@/modules/request-review";

export const metadata: Metadata = {
  title: "Revisión de solicitud",
};

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetailView id={id} />;
}

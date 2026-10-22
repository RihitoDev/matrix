import Link from "next/link";
import { PageHeading } from "@/shared/components/layout/page-heading";
import { ArrowLeft } from "lucide-react";
import { INBOX_PATH } from "../../constants/request-review.constants";
import type { DetailHeaderProps } from "../../types/detail-header-props.types";

const HEADER_CLASS = "mb-6 w-full";

// Cabecera de la bandeja con título y ayuda contextual.
export function InboxHeader() {
  return (
    <header className={HEADER_CLASS}>
      <PageHeading title="Solicitudes de acceso" description="Revisa el documento de cada solicitante y emite tu dictamen." />
    </header>
  );
}

// El detalle conserva el regreso a la bandeja y el código de la solicitud.
export function DetailHeader({ requestCode }: DetailHeaderProps) {
  return (
    <header className={`${HEADER_CLASS} flex items-center justify-between gap-4 text-sm`}>
      <Link href={INBOX_PATH} aria-label="Volver a la bandeja" className="flex items-center gap-2 text-text-secondary hover:text-accent">
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />Volver a la bandeja
      </Link>
      {requestCode ? <span className="font-medium text-text-secondary">{requestCode}</span> : null}
    </header>
  );
}

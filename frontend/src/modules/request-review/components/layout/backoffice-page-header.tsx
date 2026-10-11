import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { INBOX_PATH } from "../../constants/request-review.constants";
import type { DetailHeaderProps } from "../../types/detail-header-props.types";

const HEADER_CLASS = "w-full border-b border-border bg-surface px-8 py-4";

// Cabecera de la bandeja: subtítulo pequeño sobre el título en negrita
export function InboxHeader() {
  return (
    <header className={HEADER_CLASS}>
      <p className="text-sm text-text-secondary">Revisa el documento de cada solicitante y emite tu dictamen.</p>
      <h1 className="font-tight text-xl font-bold text-ink">Solicitudes de acceso</h1>
    </header>
  );
}

// Cabecera del detalle: flecha de volver, "Solicitudes de acceso" y el código de la solicitud en negrita
export function DetailHeader({ requestCode }: DetailHeaderProps) {
  return (
    <header className={`${HEADER_CLASS} flex items-center gap-2 text-sm`}>
      <Link href={INBOX_PATH} aria-label="Volver a la bandeja" className="text-text-secondary hover:text-ink">
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </Link>
      <Link href={INBOX_PATH} className="text-text-secondary hover:text-ink">
        Solicitudes de acceso
      </Link>
      {requestCode ? (
        <>
          <ChevronRight className="size-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
          <span className="font-semibold text-ink">{requestCode}</span>
        </>
      ) : null}
    </header>
  );
}

"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader } from "../components/layout/backoffice-page-header";
import { DataContrastPanel } from "../components/detail/data-contrast-panel";
import { DocumentViewer } from "../components/detail/document-viewer";
import { HistoryCard } from "../components/detail/history-card";
import { StatusBadge } from "../components/common/status-badge";
import { VerdictPanel } from "../components/detail/verdict-panel";
import { DOCUMENT_TYPE_LABELS } from "../constants/request-review.constants";
import { useDocumentUrl } from "../hooks/use-document-url";
import { useRequestDetail } from "../hooks/use-request-detail";
import type { ReviewStatus } from "../types/request-review.types";
import { formatLongDate } from "../utils/format-long-date";
import type { RequestDetailViewProps } from "../types/request-detail-view-props.types";

export function RequestDetailView({ id }: RequestDetailViewProps) {
  const { detail, error, isLoading } = useRequestDetail(id);
  const document = useDocumentUrl(id, Boolean(detail?.document));
  // Estado mostrado tras un dictamen en esta pantalla; se descarta si cambia la solicitud
  const [verdict, setVerdict] = useState<{ id: string; status: ReviewStatus } | null>(null);
  const currentStatus = detail ? (verdict?.id === detail.id ? verdict.status : detail.status) : null;
  const sentAt = formatLongDate(detail?.history?.submittedAt);

  return (
    <div className="w-full min-w-0">
      <DetailHeader requestCode={detail?.requestCode} />

      <section className="flex w-full min-w-0 flex-col gap-6 p-8">
        {isLoading && (
          <div className="flex flex-col gap-4" data-testid="detail-skeleton">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-[10px] border border-border bg-surface p-4 text-sm text-ink">
            {error}
          </p>
        )}

        {detail && currentStatus && (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-tight text-3xl font-extrabold text-ink">
                  {detail.firstName} {detail.lastName}
                </h1>
                <StatusBadge status={currentStatus} />
              </div>
              <p className="text-[15px] text-text-secondary">
                {detail.career}
                {sentAt ? `. Solicitud enviada el ${sentAt}.` : "."}
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.37fr)_minmax(0,1fr)]">
              <div className="min-w-0">
                {!detail.document && (
                  <p className="rounded-[10px] border border-border bg-surface p-4 text-sm text-text-secondary">
                    Esta solicitud no tiene un documento adjunto.
                  </p>
                )}
                {detail.document && document.isLoading && <Skeleton className="h-[32rem] w-full" />}
                {detail.document && document.error && (
                  <p role="alert" className="rounded-[10px] border border-border bg-surface p-4 text-sm text-ink">
                    {document.error}
                  </p>
                )}
                {detail.document && document.url && (
                  <DocumentViewer
                    url={document.url}
                    mimeType={detail.document.mimeType}
                    fileName={`${detail.document.name}.${detail.document.extension}`}
                    caption={`Documento: ${DOCUMENT_TYPE_LABELS[detail.document.type] ?? detail.document.type}`}
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-6">
                <DataContrastPanel detail={detail} />
                <VerdictPanel
                  detail={detail}
                  status={currentStatus}
                  onStatusChange={(status) => setVerdict({ id: detail.id, status })}
                />
                <HistoryCard detail={{ ...detail, status: currentStatus }} />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

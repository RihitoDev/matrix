import { Award } from "lucide-react";
import type { AreaCertificationListProps } from "../types/area-detail-components.types";
import { AreaEmptyState } from "./area-empty-state";

export function AreaCertificationList({ certifications }: AreaCertificationListProps) {
  return (
    <div className="min-w-0">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
        <Award className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
        Certificaciones
      </p>
      {certifications.length === 0 ? (
        <AreaEmptyState />
      ) : (
        <ul aria-label="Certificaciones" className="flex flex-col gap-2">
          {certifications.map((certification) => (
            <li
              key={certification.id}
              className="flex min-w-0 gap-2.5 rounded-lg border border-l-[3px] border-border border-l-gold bg-gold/5 p-3"
            >
              <Award className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <div className="min-w-0 break-words">
                <p className="text-sm font-medium text-ink">{certification.name}</p>
                <p className="text-xs text-text-secondary">
                  {`${certification.issuer} · ${certification.year}`}
                </p>
                {certification.credentialId && (
                  <p className="mt-1 font-mono text-[11px] break-all text-ink-soft">
                    {`ID ${certification.credentialId}`}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

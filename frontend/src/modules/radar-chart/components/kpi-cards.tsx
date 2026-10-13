import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiCardsProps } from "../types/radar-profile-components.types";
import { formatDecimal } from "../utils/format-decimal";
import { formatGap } from "../utils/format-gap";
import { RadarCard } from "./radar-card";

const CARD_CLASS = "flex flex-col p-5";
const VALUE_CLASS = "font-heading text-3xl leading-none font-semibold tabular-nums";
const TITLE_CLASS = "mt-3 text-[11px] font-semibold tracking-[0.12em] text-ink-soft uppercase";
const DETAIL_CLASS = "mt-1 text-xs text-text-secondary";
const HIGHLIGHT_CLASS = "font-semibold text-accent";
const VARIATION_ICON_CLASS = "size-3.5 shrink-0";

export function KpiCards({ kpis }: KpiCardsProps) {
  const isVariationNegative = kpis.variationVsPrevious < 0;

  return (
    <ul aria-label="Resumen del perfil" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RadarCard as="li" className={CARD_CLASS}>
        <p className="whitespace-nowrap">
          <span className={cn(VALUE_CLASS, "text-ink")}>{formatDecimal(kpis.globalAffinity, 2)}</span>{" "}
          <span className="text-sm text-text-secondary">/ 10</span>
        </p>
        <p className={TITLE_CLASS}>Afinidad global</p>
        <p
          className={cn(
            DETAIL_CLASS,
            "inline-flex items-center gap-1 font-semibold",
            isVariationNegative ? "text-danger" : "text-accent",
          )}
        >
          {kpis.variationVsPrevious > 0 && (
            <ArrowUpRight className={VARIATION_ICON_CLASS} aria-hidden="true" />
          )}
          {isVariationNegative && (
            <ArrowDownRight className={VARIATION_ICON_CLASS} aria-hidden="true" />
          )}
          {formatGap(kpis.variationVsPrevious)} vs. anterior
        </p>
      </RadarCard>

      <RadarCard as="li" className={CARD_CLASS}>
        <p className={cn(VALUE_CLASS, "text-accent")}>{kpis.keyAreas}</p>
        <p className={TITLE_CLASS}>Áreas clave</p>
        <p className={DETAIL_CLASS}>
          Áreas analizadas · <span className={HIGHLIGHT_CLASS}>Cobertura completa</span>
        </p>
      </RadarCard>

      <RadarCard as="li" className={CARD_CLASS}>
        <p className={cn(VALUE_CLASS, "text-accent")}>{formatDecimal(kpis.keywords)}</p>
        <p className={TITLE_CLASS}>Palabras clave</p>
        <p className={DETAIL_CLASS}>
          Tokens técnicos ·{" "}
          <span className={HIGHLIGHT_CLASS}>
            {formatDecimal(kpis.highRelevanceKeywords)} alta relevancia
          </span>
        </p>
      </RadarCard>

      <RadarCard as="li" className={CARD_CLASS}>
        <p className={cn(VALUE_CLASS, "text-ink")}>{formatDecimal(kpis.targetProfilePercent)}%</p>
        <p className={TITLE_CLASS}>Perfil objetivo</p>
        <p className={DETAIL_CLASS}>
          Compatibilidad · Umbral mín. {formatDecimal(kpis.minimumThresholdPercent)}%
        </p>
      </RadarCard>
    </ul>
  );
}

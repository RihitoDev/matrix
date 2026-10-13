import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AreaMetricsProps } from "../types/area-detail-components.types";
import { formatDecimal } from "../utils/format-decimal";
import { formatGap } from "../utils/format-gap";
import { AreaLevelBadge } from "./area-level-badge";
import { AreaScoreBar } from "./area-score-bar";

const METRIC_CLASS = "min-w-0 px-6 py-4";
const METRIC_LABEL_CLASS = "text-[11px] font-medium tracking-wider text-text-secondary uppercase";
const METRIC_VALUE_ROW_CLASS = "flex min-h-10 items-center";
const METRIC_VALUE_CLASS = "font-heading text-3xl leading-none font-semibold tabular-nums";

const GAP_ICON_CLASS = "size-5 shrink-0";

export function AreaMetrics({ score, level, gap, globalAverage }: AreaMetricsProps) {
  return (
    <dl className="grid grid-cols-1 divide-y divide-border border-y border-border bg-surface-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className={METRIC_CLASS}>
        <dt className={METRIC_LABEL_CLASS}>Puntaje</dt>
        <dd className="mt-1">
          <div className={METRIC_VALUE_ROW_CLASS}>
            <p className="whitespace-nowrap">
              <span className={cn(METRIC_VALUE_CLASS, "text-ink")}>{formatDecimal(score, 1)}</span>{" "}
              <span className="text-sm text-text-secondary">/ 10</span>
            </p>
          </div>
          <AreaScoreBar score={score} globalAverage={globalAverage} />
        </dd>
      </div>
      <div className={METRIC_CLASS}>
        <dt className={METRIC_LABEL_CLASS}>Nivel</dt>
        <dd className={cn(METRIC_VALUE_ROW_CLASS, "mt-1")}>
          <AreaLevelBadge level={level} />
        </dd>
      </div>
      <div className={METRIC_CLASS}>
        <dt className={METRIC_LABEL_CLASS}>Brecha vs. media</dt>
        <dd className={cn(METRIC_VALUE_ROW_CLASS, "mt-1")}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className={cn(
                METRIC_VALUE_CLASS,
                "inline-flex items-center gap-1 whitespace-nowrap",
                gap < 0 ? "text-danger" : "text-ink",
              )}
            >
              {gap > 0 && <ArrowUpRight className={GAP_ICON_CLASS} aria-hidden="true" />}
              {gap < 0 && <ArrowDownRight className={GAP_ICON_CLASS} aria-hidden="true" />}
              {formatGap(gap)}
            </span>
            <span className="text-xs text-text-secondary">
              vs. media global {formatDecimal(globalAverage)}
            </span>
          </div>
        </dd>
      </div>
    </dl>
  );
}

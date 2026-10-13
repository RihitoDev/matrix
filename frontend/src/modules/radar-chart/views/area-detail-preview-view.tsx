"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronRight, MousePointerClick } from "lucide-react";

import { getInitials } from "@/shared/utils/get-initials";

import { AreaDetailPanel } from "../components/area-detail-panel";
import { Epic3Shell } from "../components/epic3-shell";
import {
  AREA_DETAILS,
  AREA_ORDER,
  CANDIDATE,
  GLOBAL_AVERAGE,
} from "../data/area-details.data";
import type { AreaId } from "../types/area-detail.types";
import { formatDecimal } from "../utils/format-decimal";

const CARD_CLASS =
  "rounded-2xl border border-border bg-surface";

const TAB_PANEL_ID = "area-detail-tabpanel";

function getTabId(id: AreaId): string {
  return `area-detail-tab-${id}`;
}

export function AreaDetailPreviewView() {
  const [selectedAreaId, setSelectedAreaId] =
    useState<AreaId | null>("desarrollo");

  const tabRefs =
    useRef<Array<HTMLButtonElement | null>>([]);

  const focusableAreaId =
    selectedAreaId ?? AREA_ORDER[0];

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const lastIndex = AREA_ORDER.length - 1;

    const nextIndexByKey: Record<string, number> = {
      ArrowRight:
        index === lastIndex ? 0 : index + 1,
      ArrowLeft:
        index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    };

    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) return;

    event.preventDefault();

    setSelectedAreaId(AREA_ORDER[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <Epic3Shell>
      <main className="min-h-screen bg-background font-sans">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
          <div>
            <nav aria-label="Ruta de navegación">
              <ol className="flex items-center gap-1 text-xs text-text-secondary">
                <li>Reclutamiento</li>

                <li
                  className="flex items-center gap-1 font-medium text-ink-soft"
                  aria-current="page"
                >
                  <ChevronRight
                    className="size-3"
                    aria-hidden="true"
                  />
                  Radar Charts
                </li>
              </ol>
            </nav>

            <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-ink">
              Detalle por área
            </h1>
          </div>

          <div
            className={`${CARD_CLASS} flex flex-wrap items-center gap-4 p-5`}
          >
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-sm font-semibold text-surface"
              aria-hidden="true"
            >
              {getInitials(CANDIDATE.name)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-semibold break-words text-ink">
                {CANDIDATE.name}
              </p>

              <p className="text-sm text-text-secondary">
                {CANDIDATE.title}
              </p>
            </div>

            <p className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-heading text-2xl font-semibold text-ink tabular-nums">
                {formatDecimal(GLOBAL_AVERAGE)}
              </span>

              <span className="text-xs text-text-secondary">
                promedio
              </span>
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Áreas de afinidad"
            className={`${CARD_CLASS} flex gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:thin]`}
          >
            {AREA_ORDER.map((id, index) => {
              const isSelected =
                selectedAreaId === id;

              return (
                <button
                  key={id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={getTabId(id)}
                  aria-selected={isSelected}
                  aria-controls={
                    isSelected
                      ? TAB_PANEL_ID
                      : undefined
                  }
                  tabIndex={
                    focusableAreaId === id
                      ? 0
                      : -1
                  }
                  onClick={() =>
                    setSelectedAreaId(id)
                  }
                  onKeyDown={(event) =>
                    handleTabKeyDown(
                      event,
                      index,
                    )
                  }
                  className="group relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-text-secondary outline-none after:absolute after:inset-x-3 after:-bottom-1.5 after:h-0.5 after:rounded-full hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 aria-selected:text-ink aria-selected:after:bg-accent motion-safe:transition-colors"
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-full bg-surface-soft text-[11px] font-semibold text-text-secondary tabular-nums group-aria-selected:bg-accent group-aria-selected:text-surface motion-safe:transition-colors"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>

                  {AREA_DETAILS[id].name}

                  <span className="text-xs font-normal text-text-secondary tabular-nums">
                    {formatDecimal(
                      AREA_DETAILS[id].score,
                      1,
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedAreaId ? (
            <div
              role="tabpanel"
              id={TAB_PANEL_ID}
              aria-labelledby={getTabId(
                selectedAreaId,
              )}
            >
              <AreaDetailPanel
                area={
                  AREA_DETAILS[selectedAreaId]
                }
                onClose={() =>
                  setSelectedAreaId(null)
                }
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
              <MousePointerClick
                className="size-6 text-border-strong"
                aria-hidden="true"
              />

              <p className="text-sm text-text-secondary">
                Selecciona un área para ver su detalle
              </p>
            </div>
          )}
        </div>
      </main>
    </Epic3Shell>
  );
}
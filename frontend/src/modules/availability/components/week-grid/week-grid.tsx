"use client";

import { Button } from "@/components/ui/button";
import { toBoliviaTime } from "@/shared/utils/date-time";
import { cn } from "cn";
import {
  BLOCK_STATE_TEXT,
  DAY_LABELS,
  HOUR_HEIGHT_PX,
  SELECTED_BLOCK_CLASSES,
  SELECTED_LEGEND_LABEL,
  STATE_BUTTON_CLASSES,
  STATE_BUTTON_VARIANT,
  STATE_LABELS_ES,
  WEEK_GRID_END_HOUR,
  WEEK_GRID_LEGEND,
  WEEK_GRID_START_HOUR,
} from "../../constants/week-grid.constants";
import type { AvailabilityBlock } from "../../types/availability-block.types";
import type { WeekGridProps } from "../../types/week-grid-props.types";
import {
  getBlockVerticalPosition,
  getWeekDayDates,
  getWeekDayIndex,
  isBlockClickable,
} from "../../utils/week-grid.utils";
import { WeekDayList } from "./week-day-list";

export function WeekGrid({
  blocks,
  weekRange,
  variant,
  startHour = WEEK_GRID_START_HOUR,
  endHour = WEEK_GRID_END_HOUR,
  selectedBlockId,
  onSelectBlock,
  onEditBlock,
}: WeekGridProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const gridHeightPx = hours.length * HOUR_HEIGHT_PX;

  const dayDates = getWeekDayDates(weekRange);
  const blocksByDay: AvailabilityBlock[][] = Array.from({ length: 7 }, () => []);
  for (const block of blocks) {
    const dayIndex = getWeekDayIndex(block.startAt, weekRange);
    if (dayIndex !== null) blocksByDay[dayIndex].push(block);
  }

  function getBlockText(block: AvailabilityBlock): string {
    if (variant === "selectable" && block.state === "free") {
      return toBoliviaTime(block.startAt).time;
    }
    return BLOCK_STATE_TEXT[block.state];
  }

  function handleBlockClick(block: AvailabilityBlock) {
    if (!isBlockClickable(variant, block.state)) return;
    if (variant === "selectable") onSelectBlock?.(block);
    if (variant === "owner") onEditBlock?.(block);
  }

  return (
    <section aria-label="Disponibilidad semanal">
      <div
        className={cn(
          "hidden overflow-hidden rounded-lg border border-border",
          "md:grid md:grid-cols-[3.5rem_repeat(7,1fr)]",
        )}
      >
        <div aria-hidden="true">
          <div className="h-10 border-b border-border" />
          <ol className="relative" style={{ height: gridHeightPx }}>
            {hours.map((h) => (
              <li
                key={h}
                className="absolute right-2 text-xs text-muted-foreground"
                style={{ top: (h - startHour) * HOUR_HEIGHT_PX + 4 }}
              >
                <time dateTime={`${String(h).padStart(2, "0")}:00`}>
                  {String(h).padStart(2, "0")}:00
                </time>
              </li>
            ))}
          </ol>
        </div>

        {blocksByDay.map((dayBlocks, dayIndex) => (
          <section key={dayIndex} className="border-l border-border">
            <h3 className="flex h-10 items-center gap-1.5 border-b border-border px-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {DAY_LABELS[dayIndex]}
              </span>{" "}
              <span className="text-base font-bold">{Number(dayDates[dayIndex].slice(8))}</span>
            </h3>

            <div className="relative" style={{ height: gridHeightPx }}>
              {hours.map((h) => (
                <div
                  key={h}
                  aria-hidden="true"
                  className="absolute w-full border-t border-border"
                  style={{ top: (h - startHour) * HOUR_HEIGHT_PX }}
                />
              ))}

              <ul>
                {dayBlocks.map((block) => {
                  const { topPx, heightPx } = getBlockVerticalPosition(
                    block.startAt,
                    block.endAt,
                    startHour,
                    endHour
                  );
                  if (heightPx <= 0) return null;

                  const isSelected = block.id === selectedBlockId;
                  const stateLabel = STATE_LABELS_ES[block.state];
                  const startTime = toBoliviaTime(block.startAt).time;
                  const timeRange = `${startTime} a ${toBoliviaTime(block.endAt).time}`;

                  return (
                    <li
                      key={block.id}
                      className="absolute left-1 right-1 py-0.5"
                      style={{ top: topPx, height: heightPx }}
                    >
                      <Button
                        type="button"
                        variant={STATE_BUTTON_VARIANT[block.state]}
                        disabled={!isBlockClickable(variant, block.state)}
                        onClick={() => handleBlockClick(block)}
                        className={cn(
                          "h-full w-full justify-start rounded-md px-2 text-xs font-semibold",
                          STATE_BUTTON_CLASSES[block.state],
                          isSelected && SELECTED_BLOCK_CLASSES
                        )}
                        aria-pressed={isSelected || undefined}
                        aria-label={`${stateLabel}, ${timeRange}`}
                      >
                        {getBlockText(block)}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <WeekDayList
        blocksByDay={blocksByDay}
        dayDates={dayDates}
        variant={variant}
        selectedBlockId={selectedBlockId}
        onBlockClick={handleBlockClick}
      />

      <ul
        aria-label="Leyenda"
        className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
      >
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-4 rounded-sm border border-border"
          />
          {variant === "selectable" ? WEEK_GRID_LEGEND.freeSlot : WEEK_GRID_LEGEND.free}
        </li>
        {variant !== "selectable" && (
          <>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block h-3 w-4 rounded-sm",
                  STATE_BUTTON_CLASSES.pending,
                )}
              />
              {WEEK_GRID_LEGEND.pending}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-3 w-4 rounded-sm bg-ink" />
              {WEEK_GRID_LEGEND.confirmed}
            </li>
          </>
        )}
        {variant === "selectable" && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn("inline-block h-3 w-4 rounded-sm", SELECTED_BLOCK_CLASSES)}
            />
            {SELECTED_LEGEND_LABEL}
          </li>
        )}
      </ul>
    </section>
  );
}
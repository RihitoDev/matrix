"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOLIVIA_TIME_LABEL } from "@/shared/constants/date-time.constants";
import { addWeeks, getWeekRange } from "@/shared/utils/date-time";
import { cn } from "cn";
import { AvailabilityLoading } from "../components/availability-loading";
import { BlockSelection } from "../components/block-selection/block-selection";
import { MENTOR_FREE_BLOCKS_TEXT } from "../constants/mentor-free-blocks.constants";
import { useMentorFreeBlocks } from "../hooks/use-mentor-free-blocks";
import { availabilityApi } from "../services/availability.api";
import type { MentorFreeBlocksViewProps } from "../types/mentor-free-blocks-view-props.types";
import { formatWeekLabel } from "../utils/format-week-label";

export function MentorFreeBlocksView({ mentorId }: MentorFreeBlocksViewProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekRange(new Date()).startAt);
  const weekRange = getWeekRange(weekStart);
  const currentWeekStart = getWeekRange(new Date()).startAt;
  const { blocks, isLoading, error } = useMentorFreeBlocks(mentorId, weekRange);

  const goToNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  return (
    <div className="space-y-4 p-6">
      <header>
        <p className="text-xs font-semibold text-muted-foreground">
          {MENTOR_FREE_BLOCKS_TEXT.eyebrow}
        </p>
        <h1 className="text-2xl font-bold">{MENTOR_FREE_BLOCKS_TEXT.heading}</h1>
      </header>

      <nav
        aria-label={MENTOR_FREE_BLOCKS_TEXT.weekNavigation}
        className="flex flex-wrap items-center gap-2"
      >
        <Button
          variant="outline"
          size="icon"
          aria-label={MENTOR_FREE_BLOCKS_TEXT.previousWeek}
          onClick={() => setWeekStart(addWeeks(weekStart, -1))}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <p className="min-w-44 text-center text-sm font-medium" aria-live="polite">
          {formatWeekLabel(weekRange)}
        </p>
        <Button
          variant="outline"
          size="icon"
          aria-label={MENTOR_FREE_BLOCKS_TEXT.nextWeek}
          onClick={goToNextWeek}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          disabled={weekStart === currentWeekStart}
          onClick={() => setWeekStart(currentWeekStart)}
        >
          {MENTOR_FREE_BLOCKS_TEXT.today}
        </Button>
        <p className="ml-auto text-sm text-muted-foreground">{BOLIVIA_TIME_LABEL}</p>
      </nav>

      {isLoading ? (
        <AvailabilityLoading />
      ) : error ? (
        <p className="text-center text-destructive">{error}</p>
      ) : blocks.length === 0 ? (
        <section
          className={cn(
            "flex flex-col items-center gap-3 rounded-lg",
            "border border-dashed border-border p-8 text-center",
          )}
        >
          <p className="text-muted-foreground">{MENTOR_FREE_BLOCKS_TEXT.empty}</p>
          <Button type="button" variant="outline" onClick={goToNextWeek}>
            {MENTOR_FREE_BLOCKS_TEXT.nextWeekFromEmpty}
          </Button>
        </section>
      ) : (
        <BlockSelection
          blocks={blocks}
          weekRange={weekRange}
          fetchFreeBlocks={() => availabilityApi.getMentorFreeBlocks(mentorId, weekRange)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOLIVIA_TIME_LABEL } from "@/shared/constants/date-time.constants";
import { addWeeks, getWeekRange } from "@/shared/utils/date-time";
import { cn } from "cn";
import {
  MY_AVAILABILITY_EYEBROW,
  MY_AVAILABILITY_TEXT,
} from "../constants/my-availability.constants";
import { AvailabilityLoading } from "../components/availability-loading";
import { BlockForm } from "../components/block-form";
import { EditBlockPanel } from "../components/edit-block-panel";
import { WeekGrid } from "../components/week-grid/week-grid";
import { useCreateAvailabilityBlock } from "../hooks/use-create-availability-block";
import { useMyBlocks } from "../hooks/use-my-blocks";
import type { AvailabilityBlock } from "../types/availability-block.types";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";
import type { MentorAvailabilityViewProps } from "../types/mentor-availability-view-props.types";
import { formatWeekLabel } from "../utils/format-week-label";

export function MentorAvailabilityView({ initialWeekStart }: MentorAvailabilityViewProps) {
  const [weekStart, setWeekStart] = useState(
    () => initialWeekStart ?? getWeekRange(new Date()).startAt,
  );
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const { blocks, isLoading, error } = useMyBlocks(weekStart);
  const { createBlock, isSubmitting } = useCreateAvailabilityBlock();
  const [formKey, setFormKey] = useState(0);
  const weekRange = getWeekRange(weekStart);
  const currentWeekStart = getWeekRange(new Date()).startAt;

  const handleWeekChange = (nextWeekStart: string) => {
    setEditBlockId(null);
    setWeekStart(nextWeekStart);
  };

  const handleEditBlock = (block: AvailabilityBlock) => {
    setEditBlockId(block.id);
  };

  const handleClosePanel = () => {
    setEditBlockId(null);
  };

  const handleCreate = async (values: CreateAvailabilityBlockInput) => {
    const block = await createBlock(values);
    if (block) {
      setFormKey((key) => key + 1);
      setWeekStart(getWeekRange(block.startAt).startAt);
    }
  };

  const handleCancelCreate = () => {
    setFormKey((key) => key + 1);
  };

  const editBlock = editBlockId
    ? blocks.find((item) => item.id === editBlockId) ?? null
    : null;
  const isEditing = Boolean(editBlockId) && !error;

  return (
    <div className="space-y-4 p-6">
      <header>
        <p className="text-xs font-semibold text-muted-foreground">{MY_AVAILABILITY_EYEBROW}</p>
        <h1 className="text-2xl font-bold">{MY_AVAILABILITY_TEXT.title}</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <nav
            aria-label={MY_AVAILABILITY_TEXT.weekNavigation}
            className="flex flex-wrap items-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              aria-label={MY_AVAILABILITY_TEXT.previousWeek}
              onClick={() => handleWeekChange(addWeeks(weekStart, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <p className="min-w-44 text-center text-sm font-medium" aria-live="polite">
              {formatWeekLabel(weekRange)}
            </p>
            <Button
              variant="outline"
              size="icon"
              aria-label={MY_AVAILABILITY_TEXT.nextWeek}
              onClick={() => handleWeekChange(addWeeks(weekStart, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              disabled={weekStart === currentWeekStart}
              onClick={() => handleWeekChange(currentWeekStart)}
            >
              {MY_AVAILABILITY_TEXT.today}
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
              <p className="text-muted-foreground">{MY_AVAILABILITY_TEXT.emptyWeek}</p>
            </section>
          ) : (
            <WeekGrid
              blocks={blocks}
              weekRange={weekRange}
              variant="owner"
              onEditBlock={handleEditBlock}
            />
          )}
        </div>

        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-right duration-200">
            {isLoading ? (
              <AvailabilityLoading />
            ) : (
              <EditBlockPanel key={editBlockId} block={editBlock} onClose={handleClosePanel} />
            )}
          </div>
        ) : (
          <BlockForm
            key={formKey}
            mode="create"
            isSubmitting={isSubmitting}
            onSubmit={handleCreate}
            onCancel={handleCancelCreate}
          />
        )}
      </div>
    </div>
  );
}

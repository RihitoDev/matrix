"use client";

import { useBlockSelection } from "../../hooks/use-block-selection";
import type { BlockSelectionProps } from "../../types/block-selection-props.types";
import { WeekGrid } from "../week-grid/week-grid";
import { BlockSelectionPanel } from "./block-selection-panel";

export function BlockSelection({ blocks, weekRange, fetchFreeBlocks }: BlockSelectionProps) {
  const { selectedBlock, unavailableBlock, unavailableBlockIds, isChecking, error, selectBlock } =
    useBlockSelection(fetchFreeBlocks);

  const selectableBlocks = blocks.filter((block) => !unavailableBlockIds.includes(block.id));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <WeekGrid
        blocks={selectableBlocks}
        weekRange={weekRange}
        variant="selectable"
        selectedBlockId={selectedBlock?.id}
        onSelectBlock={selectBlock}
      />
      <BlockSelectionPanel
        selectedBlock={selectedBlock}
        unavailableBlock={unavailableBlock}
        isChecking={isChecking}
        error={error}
      />
    </div>
  );
}

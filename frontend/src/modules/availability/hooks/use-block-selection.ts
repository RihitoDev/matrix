"use client";

import { useRef, useState } from "react";
import { BLOCK_SELECTION_TEXT } from "../constants/block-selection.constants";
import type { AvailabilityBlock } from "../types/availability-block.types";

export function useBlockSelection(fetchFreeBlocks: () => Promise<AvailabilityBlock[]>) {
  const [selectedBlock, setSelectedBlock] = useState<AvailabilityBlock | null>(null);
  const [unavailableBlock, setUnavailableBlock] = useState<AvailabilityBlock | null>(null);
  const [unavailableBlockIds, setUnavailableBlockIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef(0);

  const selectBlock = async (block: AvailabilityBlock) => {
    const requestId = ++lastRequestRef.current;
    setIsChecking(true);
    setError(null);
    setUnavailableBlock(null);

    try {
      const freeBlocks = await fetchFreeBlocks();
      if (requestId !== lastRequestRef.current) return;

      const isStillFree = freeBlocks.some(
        (freeBlock) => freeBlock.id === block.id && freeBlock.state === "free",
      );
      if (isStillFree) {
        setSelectedBlock(block);
        return;
      }

      setUnavailableBlock(block);
      setUnavailableBlockIds((prev) => (prev.includes(block.id) ? prev : [...prev, block.id]));
      setSelectedBlock((prev) => (prev?.id === block.id ? null : prev));
    } catch {
      if (requestId === lastRequestRef.current) setError(BLOCK_SELECTION_TEXT.checkError);
    } finally {
      if (requestId === lastRequestRef.current) setIsChecking(false);
    }
  };

  return { selectedBlock, unavailableBlock, unavailableBlockIds, isChecking, error, selectBlock };
}

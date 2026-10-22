import type { CSSProperties } from "react";

export const SIDEBAR_STYLE = { "--sidebar-width": "16.5rem" } as CSSProperties;

export const SIDEBAR_ITEM_CLASS =
  "relative min-h-11 h-auto gap-3 rounded-md px-4 py-3 pr-7 text-sm font-medium text-surface/70 transition-colors duration-150 hover:bg-surface/5 hover:text-surface active:bg-surface/10 active:text-surface focus-visible:ring-2 focus-visible:ring-sidebar-ring data-active:bg-surface/8 data-active:font-semibold data-active:text-surface data-active:before:absolute data-active:before:top-1/2 data-active:before:right-3 data-active:before:size-1.5 data-active:before:-translate-y-1/2 data-active:before:rounded-full data-active:before:bg-surface [&_svg]:size-5 [&_svg]:shrink-0";

export const SIDEBAR_SUB_ITEM_CLASS =
  "h-auto gap-3 rounded-md px-3 py-2 text-sm text-surface/70 [&>span:last-child]:whitespace-normal transition-colors hover:bg-surface/10 hover:text-surface active:bg-surface/15 data-active:bg-surface/8 data-active:font-semibold data-active:text-surface";

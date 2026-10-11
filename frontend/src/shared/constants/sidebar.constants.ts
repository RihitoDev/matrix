import type { CSSProperties } from "react";

export const SIDEBAR_STYLE = { "--sidebar-width": "18rem" } as CSSProperties;

export const SIDEBAR_ITEM_CLASS =
  "relative h-auto gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-surface/75 transition-all duration-200 hover:bg-surface/10 hover:text-surface active:bg-surface/15 active:text-surface data-active:bg-accent data-active:font-semibold data-active:text-white data-active:shadow-sm data-active:before:absolute data-active:before:inset-y-2 data-active:before:left-0 data-active:before:w-1 data-active:before:rounded-r-md data-active:before:bg-gold [&_svg]:size-5 [&_svg]:shrink-0";

export const SIDEBAR_SUB_ITEM_CLASS =
  "h-auto gap-3 rounded-md px-3 py-2 text-sm text-surface/70 transition-colors hover:bg-surface/10 hover:text-surface active:bg-surface/15 data-active:bg-surface/10 data-active:font-semibold data-active:text-surface";

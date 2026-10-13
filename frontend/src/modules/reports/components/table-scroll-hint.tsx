import { MoveHorizontal } from "lucide-react";

export function TableScrollHint() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-text-secondary md:hidden">
      <MoveHorizontal className="size-4 shrink-0" aria-hidden="true" />
      Desliza la tabla para ver todas las columnas
    </p>
  );
}

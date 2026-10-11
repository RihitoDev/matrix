import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkillBadgeProps } from "../types/skill-badge-props.types";

export function SkillBadge({ skill, onRemove, disabled = false }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink">
      {skill.name}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        onClick={() => onRemove(skill.id)}
        aria-label={`Quitar ${skill.name}`}
        className="size-5 text-text-secondary hover:bg-transparent hover:text-accent disabled:opacity-50"
      >
        <X aria-hidden="true" className="size-3.5" />
      </Button>
    </span>
  );
}

import type { SidebarUserCardProps } from "@/shared/types/sidebar-user-card-props.types";
import { getInitials } from "@/shared/utils/get-initials";

export function SidebarUserCard({ user, action }: SidebarUserCardProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3 rounded-md p-2">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface/10 text-sm font-semibold text-surface"
        aria-hidden="true"
      >
        {getInitials(user.fullName)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-surface">{user.fullName}</span>
        <span className="truncate text-xs text-surface/70">{user.role}</span>
      </div>
      {action ? <div className="w-full border-t border-surface/15 pt-3">{action}</div> : null}
    </div>
  );
}

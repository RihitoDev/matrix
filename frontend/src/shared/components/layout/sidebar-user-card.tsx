import type { SidebarUserCardProps } from "@/shared/types/sidebar-user-card-props.types";
import { getInitials } from "@/shared/utils/get-initials";

export function SidebarUserCard({ user, action }: SidebarUserCardProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-md bg-surface/5 p-3">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface"
        aria-hidden="true"
      >
        {getInitials(user.fullName)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-surface">{user.fullName}</span>
        <span className="truncate text-xs text-surface/70">{user.role}</span>
      </div>
      {action}
    </div>
  );
}

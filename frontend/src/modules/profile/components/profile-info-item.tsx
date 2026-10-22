import type { ProfileInfoItemProps } from "../types/profile-info-item-props.types";

export function ProfileInfoItem({ label, value, icon: Icon }: ProfileInfoItemProps) {
  const text = (value ?? "").trim();
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-2 text-xs font-medium text-text-secondary">{Icon ? <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" /> : null}{label}</dt>
      <dd className={text ? "mt-1.5 break-words text-sm font-medium text-ink" : "mt-1.5 text-sm text-text-secondary"}>
        {text || "Sin registrar"}
      </dd>
    </div>
  );
}

import type { ProfileInfoItemProps } from "../types/profile-info-item-props.types";

export function ProfileInfoItem({ label, value }: ProfileInfoItemProps) {
  const text = (value ?? "").trim();

  return (
    <div>
      <dt className="text-[12.5px] font-semibold text-text-secondary">{label}</dt>
      <dd className={text ? "mt-1 text-[15px] break-words text-ink" : "mt-1 text-[15px] text-text-secondary"}>
        {text || "Sin registrar"}
      </dd>
    </div>
  );
}

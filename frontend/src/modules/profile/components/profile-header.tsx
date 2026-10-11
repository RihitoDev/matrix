import type { ProfileHeaderProps } from "../types/profile-header-props.types";

export function ProfileHeader({ title }: ProfileHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-border bg-surface px-10 py-4">
      <div>
        <p className="text-[12.5px] font-semibold text-text-secondary">Comunidad / Mi perfil</p>
        <p className="font-tight text-[20px] font-bold text-ink">{title}</p>
      </div>
      <span className="text-[12.5px] font-semibold text-ink-soft">Egresado aprobado</span>
    </header>
  );
}

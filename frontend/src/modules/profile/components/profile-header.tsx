import type { ProfileHeaderProps } from "../types/profile-header-props.types";

export function ProfileHeader({ title }: ProfileHeaderProps) {
  return (
    <header className="border-b border-border px-8 py-3">
      <nav aria-label="Ubicación en el perfil" className="flex items-center gap-2 text-xs text-text-secondary">
        <span>Comunidad</span>
        <span aria-hidden="true">/</span>
        <span>Mi perfil</span>
        {title !== "Mi perfil" ? (
          <>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-ink">{title}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}

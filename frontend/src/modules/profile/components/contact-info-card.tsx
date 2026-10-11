import type { ContactInfoCardProps } from "../types/contact-info-card-props.types";
import { getInitials } from "../utils/get-initials";
import { EditSectionLink } from "./edit-section-link";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileInfoItem } from "./profile-info-item";
import { SectionCard } from "./section-card";

export function ContactInfoCard({ profile, photoUrl }: ContactInfoCardProps) {
  const fullName = (profile.fullName ?? "").trim();
  const headline = (profile.headline ?? "").trim();

  return (
    <SectionCard
      title="Datos personales y contacto"
      action={<EditSectionLink href="/profile/personal-info" sectionName="datos personales" />}
    >
      <div className="flex items-start gap-8">
        <ProfileAvatar label={fullName ? getInitials(fullName) : "Foto"} photoUrl={photoUrl} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div>
            <p className="font-tight text-[26px] font-bold text-ink">{fullName || "Tu nombre"}</p>
            <p className={headline ? "text-[15px] text-ink-soft" : "text-[15px] text-text-secondary"}>
              {headline || "Aún no agregaste un titular profesional"}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6">
            <ProfileInfoItem label="Ciudad de residencia" value={profile.city} />
            <ProfileInfoItem label="Teléfono" value={profile.phone} />
            <ProfileInfoItem label="Correo personal" value={profile.personalEmail} />
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}

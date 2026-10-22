import { Mail, MapPin, Phone } from "lucide-react";
import type { ContactInfoCardProps } from "../types/contact-info-card-props.types";
import { getInitials } from "../utils/get-initials";
import { EditSectionLink } from "./edit-section-link";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileInfoItem } from "./profile-info-item";

export function ContactInfoCard({ profile, photoUrl }: ContactInfoCardProps) {
  const fullName = (profile.fullName ?? "").trim();
  const headline = (profile.headline ?? "").trim();

  return (
    <section aria-label="Datos personales y contacto" className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-6 p-6 lg:p-8">
        <ProfileAvatar label={fullName ? getInitials(fullName) : "Foto"} photoUrl={photoUrl} />
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-2xl font-bold text-ink">{fullName || "Tu nombre"}</h2>
          <p className="mt-2 max-w-2xl break-words text-base text-ink-soft">
            {headline || "Aún no agregaste un titular profesional"}
          </p>
        </div>
        <EditSectionLink href="/profile/personal-info" sectionName="datos personales" />
      </div>
      <dl className="grid gap-6 border-t border-border bg-surface-soft/50 px-6 py-5 md:grid-cols-3 lg:px-8">
        <ProfileInfoItem icon={MapPin} label="Ciudad de residencia" value={profile.city} />
        <ProfileInfoItem icon={Phone} label="Teléfono" value={profile.phone} />
        <ProfileInfoItem icon={Mail} label="Correo personal" value={profile.personalEmail} />
      </dl>
    </section>
  );
}

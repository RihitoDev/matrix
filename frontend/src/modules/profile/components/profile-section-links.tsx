import Link from "next/link";
import { Award, BriefcaseBusiness, ChevronRight, FileText, GraduationCap, Sparkles } from "lucide-react";

const PROFILE_SECTION_LINKS = [
  { label: "Formación académica", href: "/profile/trajectory/education", icon: GraduationCap },
  { label: "Experiencia laboral", href: "/profile/trajectory/experience", icon: BriefcaseBusiness },
  { label: "Habilidades", href: "/profile/trajectory/skills", icon: Sparkles },
  { label: "Certificaciones", href: "/profile/trajectory/certifications", icon: Award },
  { label: "Documentos y CV", href: "/profile/documents", icon: FileText },
];

export function ProfileSectionLinks() {
  return (
    <aside aria-labelledby="profile-sections-heading" className="min-w-0 lg:pl-2">
      <h2 id="profile-sections-heading" className="mb-4 text-lg font-bold text-ink">Tu trayectoria</h2>
      <ul className="divide-y divide-border">
        {PROFILE_SECTION_LINKS.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="group flex min-h-12 items-center gap-3 rounded-md px-2 py-3 text-sm font-medium text-ink transition-colors hover:bg-interaction hover:text-accent">
              <Icon className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="size-4 shrink-0 text-text-secondary group-hover:text-accent" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
